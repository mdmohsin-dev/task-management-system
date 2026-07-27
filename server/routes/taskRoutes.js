import express from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from '../controllers/taskController.js';
import {
  validateCreateTask,
  validateStatusUpdate,
} from '../validators/taskValidator.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// All task routes require authentication
router.use(protect);

router.route('/').get(getTasks).post(validateCreateTask, createTask);

router.route('/:id').patch(updateTask).delete(deleteTask);

router.patch('/:id/status', validateStatusUpdate, updateTaskStatus);

export default router;
