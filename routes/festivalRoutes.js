import express from 'express';
import {
  getAllFestivalsController,
  getNearbyFestivalsController,
} from '../controllers/festivalController.js';

const router = express.Router();

router.get('/', getAllFestivalsController);
router.get('/nearby', getNearbyFestivalsController);

// ✅ 반드시 default export 추가!
export default router;
