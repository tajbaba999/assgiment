import express from 'express';
import MessageResponse from '../interfaces/MessageResponse';
import emojis from './emojis';
import pharmaciesRouter from './pharmacies/pharmacies.route'; 
// import userRoutes  from './user/user.route';
import medicineRoutes  from './medicine/medicine.route';
import verifyToken from './verifyToken';  


const router = express.Router();

router.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });

});

// router.use('/person', userRoutes);
router.use('/emojis ', emojis);
router.use('/pharmacies', pharmaciesRouter); 
router.use('/medicine', medicineRoutes);

router.get('/protected', verifyToken,  (req, res) => {
  const pharmacyId =  req.pharmacyId;
  
  res.send(`Pharmacy ID: ${pharmacyId}`);
});




export default router;
