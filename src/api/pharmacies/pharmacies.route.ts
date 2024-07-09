import { Router } from 'express';
import { z } from 'zod';
import PharmacySchema from './pharmacies.schema';
import Pharmacy from './pharmacies.model';
import cacheMiddleware from '../redisCache';
import redis from '../redisClient';
import verifyToken from '../verifyToken'; 


const router = Router();

const PharmacyUpdateSchema = PharmacySchema.partial();

const getAllPharmaciesKey = () => 'pharmacies';
const getPharmacyKey = (id: string) => `pharmacy:${id}`;
const getPharmacyByNameKey = (name: string) => `pharmacy:name:${name}`;


router.post('/', verifyToken, async (req, res) => {
  try {
    const parsed = PharmacySchema.parse(req.body);
    const newPharmacy = new Pharmacy(parsed);
    await newPharmacy.save();
    res.status(201).json(newPharmacy);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});


router.get('/', cacheMiddleware(getAllPharmaciesKey), async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find();
    await redis.set(getAllPharmaciesKey(), JSON.stringify(pharmacies), 'EX', 3600); // Cache for 1 hour
    res.status(200).json(pharmacies);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single pharmacy by ID with caching
router.get('/:id', cacheMiddleware((req) => getPharmacyKey(req.params.id)), async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }
    await redis.set(getPharmacyKey(req.params.id), JSON.stringify(pharmacy), 'EX', 3600); // Cache for 1 hour
    res.status(200).json(pharmacy);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/name/:name', cacheMiddleware((req) => getPharmacyByNameKey(req.params.name)), async (req, res) => {
  try {
    const name = req.params.name;
    const cachedPharmacy = await redis.get(getPharmacyByNameKey(name));
    if (cachedPharmacy) {
      return res.status(200).json(JSON.parse(cachedPharmacy));
    }

    const pharmacy = await Pharmacy.findOne({ name });
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    
    await redis.set(getPharmacyByNameKey(name), JSON.stringify(pharmacy), 'EX', 3600); // Cache for 1 hour
    res.status(200).json(pharmacy);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});


router.put('/:id', verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const parsed = PharmacyUpdateSchema.parse(req.body);
    const updatedPharmacy = await Pharmacy.findByIdAndUpdate(id, parsed, { new: true, runValidators: true });

    if (!updatedPharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    res.status(200).json(updatedPharmacy);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.errors });
    }
    res.status(500).json({ message: err.message });
  }
});


router.put('/name/:name', verifyToken, async (req, res) => {
  try {
    const name = req.params.name;
    const parsed = PharmacyUpdateSchema.parse(req.body);
    const updatedPharmacy = await Pharmacy.findOneAndUpdate(
      { name },
      parsed,
      { new: true },
    );
    if (!updatedPharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }
    res.status(200).json(updatedPharmacy);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});


router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const deletedPharmacy = await Pharmacy.findByIdAndDelete(req.params.id);
    if (!deletedPharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }
    res.status(200).json({ message: 'Pharmacy deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a pharmacy by name
router.delete('/name/:name', verifyToken, async (req, res) => {
  try {
    const deletedPharmacy = await Pharmacy.findOneAndDelete({ name: req.params.name });
    if (!deletedPharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }
    res.status(200).json({ message: 'Pharmacy deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
