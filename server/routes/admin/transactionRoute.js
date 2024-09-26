import express from 'express';

import {
  addOrder,
  listOrder,
  makePayment
} from '../../controllers/transactionController.js';

import { authenticateUserMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();
import config from '../../config.js';

const { mySqlDriver } = config;
import { adminupdateOrder } from '../../cypher/order.js';
router.post('/updateOrder', authenticateUserMiddleware, async (req, res) => {
  try {
    const data = req.body;
    let { transactionId, Status, Comments } = req.body;

    await mySqlDriver.execute(
      adminupdateOrder(transactionId, Status, Comments)
    );
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
