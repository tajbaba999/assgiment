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

/**
 * @swagger
 * tags:
 *   name: Pharmacies
 *   description: Pharmacy management
 */

/**
 * @swagger
 * /api/v1/pharmacies:
 *   post:
 *     summary: Create a new pharmacy
 *     tags: [Pharmacies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pharmacy'
 *     responses:
 *       201:
 *         description: The created pharmacy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pharmacy'
 *       400:
 *         description: Bad request
 */


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

/**
 * @swagger
 * /api/v1/pharmacies:
 *   get:
 *     summary: Get all pharmacies
 *     tags: [Pharmacies]
 *     responses:
 *       200:
 *         description: List of all pharmacies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pharmacy'
 *       500:
 *         description: Internal server error
 */


router.get('/', cacheMiddleware(getAllPharmaciesKey), async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find();
    await redis.set(getAllPharmaciesKey(), JSON.stringify(pharmacies), 'EX', 3600); // Cache for 1 hour
    res.status(200).json(pharmacies);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/v1/pharmacies/{id}:
 *   get:
 *     summary: Get a pharmacy by ID
 *     tags: [Pharmacies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The pharmacy ID
 *     responses:
 *       200:
 *         description: The pharmacy data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pharmacy'
 *       404:
 *         description: Pharmacy not found
 *       500:
 *         description: Internal server error
 */


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

/**
 * @swagger
 * /api/v1/pharmacies/name/{name}:
 *   get:
 *     summary: Get a pharmacy by name
 *     tags: [Pharmacies]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The pharmacy name
 *     responses:
 *       200:
 *         description: The pharmacy data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pharmacy'
 *       404:
 *         description: Pharmacy not found
 *       500:
 *         description: Internal server error
 */


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

/**
 * @swagger
 * /api/v1/pharmacies/{id}:
 *   put:
 *     summary: Update a pharmacy by ID
 *     tags: [Pharmacies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The pharmacy ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PharmacyUpdate'
 *     responses:
 *       200:
 *         description: The updated pharmacy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pharmacy'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Pharmacy not found
 *       500:
 *         description: Internal server error
 */


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

/**
 * @swagger
 * /api/v1/pharmacies/name/{name}:
 *   put:
 *     summary: Update a pharmacy by name
 *     tags: [Pharmacies]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The pharmacy name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PharmacyUpdate'
 *     responses:
 *       200:
 *         description: The updated pharmacy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pharmacy'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Pharmacy not found
 *       500:
 *         description: Internal server error
 */


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

/**
 * @swagger
 * /api/v1/pharmacies/{id}:
 *   delete:
 *     summary: Delete a pharmacy by ID
 *     tags: [Pharmacies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The pharmacy ID
 *     responses:
 *       200:
 *         description: Pharmacy deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Pharmacy deleted
 *       404:
 *         description: Pharmacy not found
 *       500:
 *         description: Internal server error
 */

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

/**
 * @swagger
 * /api/v1/pharmacies/name/{name}:
 *   delete:
 *     summary: Delete a pharmacy by name
 *     tags: [Pharmacies]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The pharmacy name
 *     responses:
 *       200:
 *         description: Pharmacy deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Pharmacy deleted
 *       404:
 *         description: Pharmacy not found
 *       500:
 *         description: Internal server error
 */
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
