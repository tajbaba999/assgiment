/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/dot-notation */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string | undefined;
  pharmacyId: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    pharmacyId?: string;
  }
}

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(403).send('Token is required');
  }

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    // console.log(decoded); 
    req.pharmacyId = decoded.userId;
    next();
  } catch (err) {
    // console.error(err); 
    return res.status(401).send('Invalid token');
  }
};

export default verifyToken;
