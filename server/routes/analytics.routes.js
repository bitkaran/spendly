import express from 'express';
import {
  getSummary,
  getCategoryTotals,
  getMonthlyTrend,
  getCustomTotal,
} from '../controllers/analytics.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/summary', getSummary);
router.get('/category-total', getCategoryTotals);
router.get('/monthly', getMonthlyTrend);
router.get('/custom-total', getCustomTotal);

export default router;
