import { createClient } from 'redis';

const redisUrl = `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`;

const redisClient = createClient({
    url: redisUrl
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

// connect to redis
(async () => {
    if (process.env.CACHE_ENABLED !== 'true') {
        console.log('Redis Cache Disabled');
        return;
    }

    try {
        await redisClient.connect();
    } catch (error) {
        console.error("Could not connect to Redis", error);
    }
})();

export default redisClient;
