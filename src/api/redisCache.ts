import { Request, Response, NextFunction } from 'express';
import redis from './redisClient';


const cacheMiddleware = (keyGenerator: (req: Request) => string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const cacheKey = keyGenerator(req);
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      }
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        redis.set(cacheKey, JSON.stringify(body), 'EX', 3600); 
        return originalJson(body);
      };
      next();
    } catch (err) {
      console.error('Cache error:', err);
      next();
    }
  };
};

export default cacheMiddleware;
