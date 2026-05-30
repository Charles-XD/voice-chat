const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const redis = require("redis");
const cors = require("cors");
const crypto = require("crypto");

const redisClient = redis.createClient({
  host: "127.0.0.1",
  port: 6379,
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

// clear online users
redisClient.del("users:online", (err) => {
  if (err) {
    console.error("Error removing user from Redis:", err);
    return;
  }
});

// ---------------------------------------------------------------------------
// Rooms: live, ephemeral state describing the currently active voice rooms.
// `rooms` is a SET index of active room ids, and each room is a hash at
// `room:<id>`. Because rooms only exist while the server is running, we wipe
// them on every boot.
// ---------------------------------------------------------------------------
const ROOMS_INDEX = "rooms";
const roomKey = (id) => `room:${id}`;

function resetRooms() {
  redisClient.smembers(ROOMS_INDEX, (err, ids) => {
    if (err) {
      console.error("Error reading rooms during reset:", err);
      return;
    }

    const multi = redisClient.multi();
    (ids || []).forEach((id) => multi.del(roomKey(id)));
    multi.del(ROOMS_INDEX);
    multi.exec((execErr) => {
      if (execErr) console.error("Error resetting rooms:", execErr);
      else console.log(`Reset ${ids ? ids.length : 0} active room(s).`);
    });
  });
}

resetRooms();

// Convert a raw Redis hash into a typed room object.
function serializeRoom(room) {
  return {
    id: room.id,
    name: room.name,
    isPublic: room.isPublic === "1",
    creatorId: room.creatorId,
    allowed: JSON.parse(room.allowed || "[]"),
    createdAt: Number(room.createdAt) || 0,
  };
}

function readRoom(id, cb) {
  redisClient.hgetall(roomKey(id), (err, data) => {
    if (err) return cb(err);
    if (!data || !data.id) return cb(null, null);
    cb(null, serializeRoom(data));
  });
}

// The socket.io room membership is the source of truth for who is currently
// connected to a room. Each member carries its display name and mic state,
// which live on the socket (socket.data) for the lifetime of the connection.
function memberOf(socket) {
  return {
    id: socket.id,
    name: (socket.data && socket.data.name) || socket.id.slice(0, 6),
    muted: Boolean(socket.data && socket.data.muted),
  };
}

function roomMembers(id) {
  return Array.from(io.sockets.adapter.rooms.get(id) || [])
    .map((sid) => io.sockets.sockets.get(sid))
    .filter(Boolean)
    .map(memberOf);
}

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(express.static("public")); // serve frontend
app.use(cors({ origin: "*" })); // serve frontend
app.use(express.json()); // parse JSON request bodies

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // 1. Add the new user to the online set
  redisClient.sadd("users:online", socket.id, (err, reply) => {
    if (err) {
      console.error("Error adding user to Redis:", err);
      return;
    }

    // 2. Get the updated count of online users
    redisClient.scard("users:online", (err, count) => {
      if (err) {
        console.error("Error getting user count from Redis:", err);
        return;
      }

      // 3. Broadcast the *count* to all connected clients
      // (Including the new client, so they get the updated total)
      io.emit("user-count-update", count);
      console.log(`User ${socket.id} connected. Total online: ${count}`);
    });
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    // Notify the room (if any) so member lists stay in sync.
    if (socket.room) {
      socket.to(socket.room).emit("user-leave-room", { room: socket.room, user: socket.id });
    }

    // 1. Remove the disconnected user from the online set
    redisClient.srem("users:online", socket.id, (err, removedCount) => {
      if (err) {
        console.error("Error removing user from Redis:", err);
        return;
      }

      if (removedCount > 0) {
        // 2. Get the updated count
        redisClient.scard("users:online", (err, count) => {
          if (err) {
            console.error("Error getting user count from Redis:", err);
            return;
          }

          // 3. Broadcast the updated count to all clients
          io.emit("user-count-update", count);
          console.log(`User ${socket.id} disconnected. Total online: ${count}`);
        });
      }
    });
  });


  redisClient.lrange("chat:general", 0, -1, (err, messages) => {
    if (err) return;

    const parsed = messages.map((m) => JSON.parse(m));
    socket.emit("chat-history", parsed);
  });

  socket.on("ping-check", (sentTime) => {
    socket.emit("pong", sentTime);
  });

  socket.on("join-room", (payload, ack) => {
    const room = typeof payload === "string" ? payload : payload && payload.room;
    const name = payload && typeof payload === "object" ? payload.name : undefined;
    if (!room) {
      if (typeof ack === "function") ack({ success: false });
      return;
    }

    socket.join(room);
    socket.room = room;
    socket.data.name = name || socket.id.slice(0, 6);
    socket.data.muted =
      payload && typeof payload === "object" && payload.muted !== undefined
        ? Boolean(payload.muted)
        : true;

    // Send the joiner everyone already in the room (with names + mic state).
    const others = roomMembers(room).filter((m) => m.id !== socket.id);
    socket.emit("all-clients", others);

    // Tell the room about the new member.
    socket.to(room).emit("user-join-room", { room, user: memberOf(socket) });

    if (typeof ack === "function") ack({ success: true });
  });

  socket.on("leave-room", (room) => {
    socket.leave(room);

    socket.to(room).emit("user-leave-room", { room: room, user: socket.id });
  });

  // Authoritative roster lookup. Lets a freshly-mounted client pull the current
  // members (with names + mic state) without racing the join-time broadcast.
  socket.on("get-members", (room, ack) => {
    const target = room || socket.room;
    const members = target ? roomMembers(target) : [];
    if (typeof ack === "function") ack(members);
  });

  // Broadcast a member's mic (mute) state to the whole room — including the
  // sender — so every client's roster stays in sync.
  socket.on("mic-status", (payload) => {
    const muted = Boolean(payload && payload.muted);
    socket.data.muted = muted;
    if (socket.room) {
      io.to(socket.room).emit("mic-status", { user: socket.id, muted });
    }
  });

  // Relay WebRTC signaling messages
  socket.on("offer", (data) => {
    socket.to(data.target).emit("offer", {
      sdp: data.sdp,
      from: socket.id,
    });
  });

  socket.on("answer", (data) => {
    socket.to(data.target).emit("answer", {
      sdp: data.sdp,
      from: socket.id,
    });
  });

  socket.on("ice-candidate", (data) => {
    socket.to(data.target).emit("ice-candidate", {
      candidate: data.candidate,
      from: socket.id,
    });
  });

  socket.on("chat-message", (message) => {
    if (!socket.room) return;
    const text = typeof message === "string" ? message : message && message.message;
    if (!text) return;
    const data = {
      id: socket.id,
      from: (socket.data && socket.data.name) || socket.id.slice(0, 6),
      message: text,
      time: new Date().toLocaleTimeString(),
    };
    io.to(socket.room).emit("chat-message", data);

    if (socket.room === "general") {
      redisClient.rpush("chat:general", JSON.stringify(data));

      // Keep only last 100 messages
      redisClient.ltrim("chat:general", -100, -1);
      redisClient.ttl("chat:general", (err, ttl) => {
        if (ttl === -1) {
          redisClient.expire("chat:general", 86400); // 24 hours
        }
      });

      io.to("chat:general").emit("chat-history", [
        {
          from: socket.id.slice(0, 6),
          message,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    }
  });
});

app.get('/api', (req, res) => {
  const { key } = req.query;
  if (!key) res.status(404).send("NOT_FOUND");
  redisClient.hget(key, "name", (err, result) => {
    if (err) res.status(400).send("REDIS_ERROR");
    res.send({
      name: result,
    })
  });
});

app.post('/api/name', (req, res) => {
  const { key, name } = req.body;
  if (!key || !name) return res.status(400).send("BAD_REQUEST");

  // Only update existing accounts, never create one from a stray key.
  redisClient.exists(key, (existsErr, exists) => {
    if (existsErr) return res.status(400).send("REDIS_ERROR");
    if (!exists) return res.status(404).send("NOT_FOUND");

    redisClient.hset(key, "name", name, (err) => {
      if (err) return res.status(400).send("REDIS_ERROR");
      res.send({ name });
    });
  });
});

// Create a new room. Rooms default to private; the creator becomes the owner.
// The client only supplies a human-readable title — the backend mints the
// unique id that is used as the socket.io room name.
app.post('/api/rooms', (req, res) => {
  const { key, title, isPublic } = req.body;
  if (!key || !title) return res.status(400).send("BAD_REQUEST");

  // Only registered accounts can own a room.
  redisClient.exists(key, (existsErr, exists) => {
    if (existsErr) return res.status(400).send("REDIS_ERROR");
    if (!exists) return res.status(404).send("NOT_FOUND");

    const id = crypto.randomBytes(6).toString("hex");
    const room = {
      id,
      name: String(title).trim().slice(0, 80),
      isPublic: isPublic ? "1" : "0",
      creatorId: key,
      allowed: JSON.stringify([]),
      createdAt: String(Date.now()),
    };

    const multi = redisClient.multi();
    multi.hmset(roomKey(id), room);
    multi.sadd(ROOMS_INDEX, id);
    multi.exec((execErr) => {
      if (execErr) return res.status(400).send("REDIS_ERROR");
      res.send(serializeRoom(room));
    });
  });
});

// Fetch a single room's public state.
app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  if (!roomId) return res.status(400).send("BAD_REQUEST");

  readRoom(roomId, (err, room) => {
    if (err) return res.status(400).send("REDIS_ERROR");
    if (!room) return res.status(404).send("NOT_FOUND");
    room.users = roomMembers(roomId);
    res.send(room);
  });
});

// Checks whether the requesting user may join a room. Public rooms are open to
// everyone; private rooms only admit the owner and explicitly allowed users.
app.get('/api/rooms/:roomId/can-join', (req, res) => {
  const { roomId } = req.params;
  const { key } = req.query;
  if (!roomId) return res.status(400).send("BAD_REQUEST");

  readRoom(roomId, (err, room) => {
    if (err) return res.status(400).send("REDIS_ERROR");
    if (!room) return res.send({ allowed: false });

    const allowed =
      room.isPublic ||
      (key && key === room.creatorId) ||
      (key && room.allowed.includes(key));

    room.users = roomMembers(roomId);
    res.send({ allowed: Boolean(allowed), room });
  });
});

// The room owner grants another user access to a private room.
app.post('/api/rooms/:roomId/allow', (req, res) => {
  const { roomId } = req.params;
  const { key, userId } = req.body;
  if (!key || !userId) return res.status(400).send("BAD_REQUEST");

  readRoom(roomId, (err, room) => {
    if (err) return res.status(400).send("REDIS_ERROR");
    if (!room) return res.status(404).send("NOT_FOUND");
    if (room.creatorId !== key) return res.status(403).send("FORBIDDEN");

    if (!room.allowed.includes(userId)) room.allowed.push(userId);
    redisClient.hset(roomKey(roomId), "allowed", JSON.stringify(room.allowed), (hsetErr) => {
      if (hsetErr) return res.status(400).send("REDIS_ERROR");
      res.send(room);
    });
  });
});

app.listen(4000, () => {
  console.log('API is running...')
});

const PORT = 3000;
httpServer.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
