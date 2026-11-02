import express from 'express';
import { getAllUsers, updateUser, deleteUser } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
