/* eslint-disable @typescript-eslint/semi */
import { Router } from 'express';
import medicineSchema from './medicine.schema';
import Medicine from './medicine.model'; 
import * as z from 'zod';

const router = Router();


router.post('/', async (req, res) => {
  try {
    const parsed = medicineSchema.parse(req.body)
    const newMedicine = new Medicine(parsed);
    await newMedicine.save();
    res.status(201).json(newMedicine);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: err.errors });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
});


router.get('/', async (req, res) => {
  try {
    const medicines = await Medicine.find().populate('pharmacy');
    res.status(200).json(medicines);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/:id', async (req, res) => {
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


router.get('/name/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const medicines = await Medicine.find({ name }).populate('pharmacy');
    if (medicines.length === 0) {
      return res.status(404).json({ message: 'No medicines found with this name' });
    }
    res.status(200).json(medicines);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/pharmacy/:pharmacyId', async (req, res) => {
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

router.put('/:id', async (req, res) => {
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


router.put('/name/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const parsed = medicineSchema.parse(req.body); // Use the correct schema
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

router.delete('/:id', async (req, res) => {
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


router.delete('/name/:name', async (req, res) => {
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
