import express from 'express';

import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, 'public/uploads');
  },
  filename: (req, file, callBack) => {
    callBack(null, `${file.originalname}.png`);
  }
});
let upload = multer({ dest: 'public/uploads/', storage });

import {
  getChildrenList,
  getBarangayList,
  getDashboardDatePerBarangay,
  getReportPerBarangay,
  createChildren,
  getOverallStatistics,
  getUser,
  getChildInfo,
  updateChildInfo,
  deleteChildRecord
} from '../controllers/childController.js';

import {
  listCustomer,
  createCustomerController
} from '../controllers/customer.js';

import {
  createSupplierController,
  listSupplierController,
  uploadFile,
  listSupplierPaymentHistory
} from '../controllers/supplier.js';

import { authenticateUserMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

import config from '../config.js';

// router.post(
//   '/uploadFile',
//   authenticateUserMiddleware,
//   upload.single('file'),
//   uploadFile
// );

router.post('/create', authenticateUserMiddleware, createSupplierController);

router.post('/list', authenticateUserMiddleware, listSupplierController);

router.post(
  '/supplierPaymentHistory',
  authenticateUserMiddleware,
  listSupplierPaymentHistory
);

router.post(
  '/uploadFile',
  authenticateUserMiddleware,
  upload.single('file'),
  uploadFile
);
export default router;
