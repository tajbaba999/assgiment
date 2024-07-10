import * as z from 'zod';

const Pharmacies = z.object({
  name: z.string().optional(),
  address: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    zip_code: z.string().optional(),
    location : z.string().optional(),
  }).optional(),
  contactInformation: z.string().optional(),
  phone_number: z.string().optional(),
  email: z.string().email().optional(),
  license_number: z.string().optional(),
  owner_name: z.string().optional(),
});

type Pharmacies = z.infer<typeof Pharmacies>;

export default Pharmacies;
