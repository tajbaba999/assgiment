/* eslint-disable import/no-extraneous-dependencies */
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from './user.model';
import { userLoginSchema, userRegisterSchema } from './user.schema';
import { z } from 'zod';

const router = Router();

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

router.post('/login', async (req, res) => {
  try {
    const parsedData = userLoginSchema.parse(req.body);
    const { email, password } = parsedData;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.errors });
    }
    res.status(500).json({ message: err.message });
  }
});

router.get('/test', (req, res) =>{
  const bod = req.body;
  console.log(bod);
  res.json(bod);
});

export default router;
