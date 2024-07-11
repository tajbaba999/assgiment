/* eslint-disable import/no-extraneous-dependencies */
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from './user.model';
import { userLoginSchema, userRegisterSchema } from './user.schema';
import { z } from 'zod';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /person/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */

router.post('/register', async (req, res) => {
  try {
    const parsedData = userRegisterSchema.parse(req.body);
    console.log(parsedData);
    const { username, email, password } = parsedData;
    const user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.errors });
    }
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /person/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */

router.post('/login', async (req, res) => {
  try {
    const parsedData = userLoginSchema.parse(req.body);
    const { email, password } = parsedData;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!);
    res.status(200).json({ token });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.errors });
    }
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /person/test:
 *   get:
 *     summary: Test endpoint
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Test endpoint response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

router.get('/test', (req, res) =>{
  const bod = req.body;
  console.log(bod);
  res.json(bod);
});

export default router;
