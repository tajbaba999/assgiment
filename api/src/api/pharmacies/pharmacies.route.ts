import { Router } from 'express';
import { z } from 'zod';
import Pharmacies from './pharmacies.model';

const router = Router();

router.get<{}, z.infer<typeof Pharmacies>[]>('/', (req, res) => {
    res.json([{
        name: "Medplus",
        address: {
            city: "hyd",
            state: "Tela",
            zip_code: "3434",
        },
        contactInformation: "asfdasf",
        phone_number: "1234567890",
        email: "mail@asdf.com",
        license_number: "licasdf",
        owner_name: "aesdfasf",
    }]);
});

export default router;
