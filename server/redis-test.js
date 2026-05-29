const redis = require("redis");

const redisClient = redis.createClient({
  host: "localhost",
  port: 6379,
});

redisClient.on("connect", () => {
  console.log("connected");
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});


const key = 'chat:general';

const data = {
  id: 123,
  name: 'Sepehr',
  roles: ['admin', 'trader']
};

const ttl = 60; // seconds (1 hour)

redisClient.setex(key, ttl, JSON.stringify(data), (err, reply) => {
  if (err) throw err;
  console.log('Saved:', reply); // OK
});