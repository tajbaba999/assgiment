import * as z from 'zod';

const Pharmacies = z.object({
    name: z.string().nonempty("Name is required"),
    address: z.object({
        city: z.string(),
        state: z.string(),
        zip_code: z.string(),
    }),
    contactInformation: z.string(),
    phone_number: z.string().nonempty("Phone number is required"),
    email: z.string().email("Invalid email address"),
    license_number: z.string(),
    owner_name: z.string(),
});

type Pharmacies = z.infer<typeof Pharmacies>;

export default Pharmacies;
