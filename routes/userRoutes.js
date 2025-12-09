import {Router} from 'express';

import authMiddleware from '../middleware/authMiddleware.js';
import {getUser, updateProfile, deleteUser}  from '../controllers/userController.js';

const router = Router();

router.get('/me', authMiddleware, getUser);
router.patch('/update-profile', authMiddleware, updateProfile);
router.delete('/delete-account', authMiddleware, deleteUser);
export default router;