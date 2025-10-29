import express from 'express';
import {
  getAllFestivalsController,
  getNearbyFestivalsController,
  getFilteredFestivalController,
  getFestivalsByTypeController
} from '../controllers/festivalController.js';

const router = express.Router();

router.get('/', getAllFestivalsController);
router.get('/nearby', getNearbyFestivalsController);
router.get('/category', getFilteredFestivalController);
router.get('/type', getFestivalsByTypeController);      // /api/festivals/type?type=indoor
router.get('/indoor', getFestivalsByTypeController);    // /api/festivals/indoor   
router.get('/outdoor', getFestivalsByTypeController);   // /api/festivals/outdoor

// 반드시 default export 추가!
export default router;
