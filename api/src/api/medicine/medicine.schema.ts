import { z } from 'zod';


const medicineSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description needed'),
  price: z.number().positive('postive'),
  stock: z.number().int().nonnegative('postitive'),
  pharmacy: z.string().uuid('Invalid ID'), 
});


type IMedicine = z.infer<typeof medicineSchema>;


export default medicineSchema;
export type { IMedicine };
