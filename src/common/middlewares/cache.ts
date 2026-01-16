import { Request, Response, NextFunction } from 'express';
import redisClient from '../../config/redis';

export const cache = (duration: number) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Skip if Cache is disabled
        if (process.env.CACHE_ENABLED !== 'true') {
            next();
            return;
        }

        // Skip caching if request is not GET
        if (req.method !== 'GET') {
            next();
            return;
        }

        const key = `cache:${req.originalUrl || req.url}`;

        try {
            const cachedBody = await redisClient.get(key);
            if (cachedBody) {
                // Return cached response
                res.setHeader('X-Cache', 'HIT');
                res.setHeader('Content-Type', 'application/json');
                res.send(cachedBody); // Use send directly since it's already a string
                return;
            } else {
                // If not cached, hook into res.json to cache response
                res.setHeader('X-Cache', 'MISS');
                const originalJson = res.json; // Save original json method

                // Override res.json method
                res.json = (body: any): Response => {
                    // Send response first
                    const response = originalJson.call(res, body);
                    // Then cache it asynchronously
                    redisClient.setEx(key, duration, JSON.stringify(body)).catch(err => {
                        console.error('Redis cache error:', err);
                    });
                    return response;
                };
                next();
            }
        } catch (error) {
            console.error('Redis middleware error:', error);
            // If redis fails, proceed without caching
            next();
        }
    };
};
