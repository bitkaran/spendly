import express from 'express';
import { getSettings, updateSettings } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/settings')
  .get(getSettings)
  .put(updateSettings);

export default router;
