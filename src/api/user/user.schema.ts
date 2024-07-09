import { z } from 'zod';

export const userRegisterSchema = z.object({
  username: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
});

export const userLoginSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6),
});
