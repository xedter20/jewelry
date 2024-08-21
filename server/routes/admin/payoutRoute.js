import express from 'express';

import {
  createPayoutRequest,
  listPayoutAsAdmin,
  getPayout,
  changePayoutStatus
} from '../../controllers/payoutController.js';

import {
  authenticateUserMiddleware,
  authenticateAsAdmin
} from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get(
  '/listPayout',
  authenticateUserMiddleware,
  authenticateAsAdmin,
  listPayoutAsAdmin
);

router.get('/getPayout/:ID', authenticateUserMiddleware, getPayout);

router.post(
  '/changePayoutStatus',
  authenticateUserMiddleware,
  changePayoutStatus
);

export default router;
