import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

let redisClient = null;
let isRedisAvailable = false;

try {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      if (times > 2) {
        return null; // Stop retrying quickly so dev startup is instant
      }
      return 1000;
    },
    lazyConnect: true,
  });

  redisClient.connect().then(() => {
    isRedisAvailable = true;
    console.log('[Cache/Queue] Connected to Redis server.');
  }).catch((err) => {
    isRedisAvailable = false;
    console.log('[Cache/Queue] Redis not reachable on port 6379. Using in-memory resilient asynchronous job processor.');
  });

  redisClient.on('error', (err) => {
    isRedisAvailable = false;
  });
} catch (e) {
  isRedisAvailable = false;
}

export { redisClient, isRedisAvailable };
