/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/semi */
import { Router, Request, Response } from 'express';
import multer from 'multer';
import medicineSchema from './medicine.schema';
import Medicine from './medicine.model'; 
import * as z from 'zod';
import verifyToken from '../verifyToken';
import cloudinary from '../../cloudinaryConfig';
import fs from 'fs';

const router = Router();

const upload = multer({ dest: 'uploads/' }); 

router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }


    const result = await cloudinary.uploader.upload(req.file.path);

    // Parse and validate request body with additional image URL and pharmacy ID
    const parsed = medicineSchema.parse({
      ...req.body,
      pharmacy: req.pharmacyId,
      image: result.secure_url,
    });


    const newMedicine = new Medicine(parsed);
    await newMedicine.save();

    fs.unlinkSync(req.file.path);

    res.status(201).json(newMedicine);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: err.errors });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
});


router.get('/', async (req: Request, res: Response) => {
  try {
    const medicines = await Medicine.find().populate('pharmacy');
    res.status(200).json(medicines);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const medicine = await Medicine.findById(req.params.id).populate('pharmacy');
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.status(200).json(medicine);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/name/:name', async (req: Request, res: Response) => {
  try {
    const name = req.params.name;
    const medicines = await Medicine.find({ name }).populate('pharmacy');
    res.status(200).json(medicines);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/pharmacy/:pharmacyId', async (req: Request, res: Response) => {
  try {
    const pharmacyId = req.params.pharmacyId;
    const medicines = await Medicine.find({ pharmacy: pharmacyId }).populate('pharmacy');
    if (medicines.length === 0) {
      return res.status(404).json({ message: 'No medicines found for this pharmacy' });
    }
    res.status(200).json(medicines);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const parsed = medicineSchema.parse(req.body); 
    const updatedMedicine = await Medicine.findByIdAndUpdate(id, parsed, { new: true, runValidators: true }).populate('pharmacy');
    if (!updatedMedicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.status(200).json(updatedMedicine);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.errors });
    }
    res.status(500).json({ message: err.message });
  }
});

router.put('/name/:name', async (req: Request, res: Response) => {
  try {
    const name = req.params.name;
    const parsed = medicineSchema.parse(req.body);
    const updatedMedicines = await Medicine.updateMany({ name }, parsed, { new: true, runValidators: true }).populate('pharmacy');
    if (updatedMedicines.matchedCount === 0) {
      return res.status(404).json({ message: 'No medicines found with this name' });
    }
    res.status(200).json(updatedMedicines);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.errors });
    }
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deletedMedicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!deletedMedicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.status(200).json({ message: 'Medicine deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/name/:name', async (req: Request, res: Response) => {
  try {
    const name = req.params.name;
    const deletedMedicines = await Medicine.deleteMany({ name });
    if (deletedMedicines.deletedCount === 0) {
      return res.status(404).json({ message: 'No medicines found with this name' });
    }
    res.status(200).json({ message: 'Medicines deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
