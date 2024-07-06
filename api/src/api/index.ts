import express from 'express';
import MessageResponse from '../interfaces/MessageResponse';
import emojis from './emojis';
import pharmaciesRouter from './pharmacies/pharmacies.route'; 

const router = express.Router();

router.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.use('/emojis', emojis);
router.use('/pharmacies', pharmaciesRouter); 

export default router;
