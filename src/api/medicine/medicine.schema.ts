/* eslint-disable @typescript-eslint/quotes */
import { z } from "zod";

const medicineSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.string().optional(),
  stock: z.string().optional(),
  pharmacy: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid object form").optional(),
});

type IMedicine = z.infer<typeof medicineSchema>;

export default medicineSchema;
export type { IMedicine };
