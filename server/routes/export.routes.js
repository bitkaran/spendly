import express from 'express';
import { exportToExcel } from '../controllers/export.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/excel', protect, exportToExcel);

export default router;
