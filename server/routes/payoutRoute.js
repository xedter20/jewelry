import express from 'express';

import {
  createPayoutRequest,
  listPayout,
  getPayout,
  changePayoutStatus,
  listDeductionHistory
} from '../controllers/payoutController.js';

import { authenticateUserMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/createPayoutRequest',
  authenticateUserMiddleware,
  createPayoutRequest
);

router.get('/listPayout', authenticateUserMiddleware, listPayout);
router.get(
  '/listDeductionHistory',
  authenticateUserMiddleware,
  listDeductionHistory
);

router.get('/getPayout/:ID', authenticateUserMiddleware, getPayout);

export default router;
