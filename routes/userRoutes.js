import {Router} from 'express';

import authMiddleware from '../middleware/authMiddleware.js';
import {getUser, updateProfile, deleteUser, deleteUserByAdmin}  from '../controllers/userController.js';

const router = Router();

router.get('/me', authMiddleware, getUser);
router.patch('/update-profile', authMiddleware, updateProfile);
router.delete('/delete-account', authMiddleware, deleteUser);
router.delete('/admin-delete-account',  deleteUserByAdmin);
export default router;