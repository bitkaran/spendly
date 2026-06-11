import express from 'express';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expense.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply auth protection middleware to all expense routes
router.use(protect);

router.route('/')
  .get(getExpenses)
  .post(createExpense);

router.route('/:id')
  .get(getExpenseById)
  .put(updateExpense)
  .delete(deleteExpense);

export default router;
