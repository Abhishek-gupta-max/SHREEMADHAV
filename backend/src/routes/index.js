import { Router } from 'express';
import publicRoutes from './public.routes.js';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import { ok } from '../utils/response.js';

const router = Router();

router.get('/health', (_req, res) => ok(res, { status: 'ok', time: new Date().toISOString() }));
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/', publicRoutes);

export default router;
