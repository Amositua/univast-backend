import {Router} from 'express';

import authMiddleware from '../middleware/authMiddleware.js';
import {getUser, updateProfile}  from '../controllers/userController.js';

const router = Router();

router.get('/me', authMiddleware, getUser);
router.patch('/update-profile', authMiddleware, updateProfile);

export default router;