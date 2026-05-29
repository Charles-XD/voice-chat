const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const redis = require("redis");
const cors = require("cors");

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

  socket.on("join-room", (room) => {
    socket.join(room);
    socket.room = room;

    const clients = Array.from(io.sockets.adapter.rooms.get(room) || []);
    socket.emit(
      "all-clients",
      clients.filter((id) => id !== socket.id)
    );

    socket.to(room).emit("user-join-room", { room: room, user: socket.id });
  });

  socket.on("leave-room", (room) => {
    socket.leave(room);

    socket.to(room).emit("user-leave-room", { room: room, user: socket.id });
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
    const data = {
      from: socket.id.slice(0, 6),
      message,
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

app.listen(4000, () => {
  console.log('API is running...')
});

const PORT = 3000;
httpServer.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
