import { Router } from 'express';
import * as auth from '../controllers/auth.controller.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { changePasswordSchema, loginSchema, updateProfileSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/login', loginLimiter, validate(loginSchema), auth.login);
router.post('/logout', optionalAuth, auth.logout);
router.post('/logout-all', requireAuth, auth.logoutEverywhere);
router.get('/me', requireAuth, auth.me);
router.get('/session', optionalAuth, auth.session);
router.patch('/profile', requireAuth, validate(updateProfileSchema), auth.updateProfile);
router.patch('/password', requireAuth, loginLimiter, validate(changePasswordSchema), auth.changePassword);

export default router;
