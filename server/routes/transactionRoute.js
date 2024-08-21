import express from 'express';

import { addOrder, listOrder } from '../controllers/transactionController.js';

import { authenticateUserMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// router.post('/approvedMatching', authenticateUserMiddleware, approvedMatching);

// router.post(
//   '/getDashboardStats',
//   authenticateUserMiddleware,
//   getDashboardStats
// );

router.post('/addOrder', authenticateUserMiddleware, addOrder);

router.post('/listOrder', authenticateUserMiddleware, listOrder);

export default router;
