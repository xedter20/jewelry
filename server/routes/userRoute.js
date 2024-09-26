import express from 'express';

import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, 'uploads');
  },
  filename: (req, file, callBack) => {
    callBack(null, `${file.originalname}_${Date.now()}.xlsx`);
  }
});
let upload = multer({ dest: 'uploads/', storage });

import {
  getChildrenList,
  getBarangayList,
  getDashboardDatePerBarangay,
  getReportPerBarangay,
  uploadFile,
  createChildren,
  getOverallStatistics,
  getUser,
  getChildInfo,
  updateChildInfo,
  deleteChildRecord
} from '../controllers/childController.js';

import {
  listCustomer,
  createCustomerController,
  findCustomer
} from '../controllers/customer.js';

import {
  listEmployeeController,
  createemployeeController,
  editEmployeeController
  // createCustomerController
} from '../controllers/employee.js';

import { authenticateUserMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

import config from '../config.js';

const { cypherQuerySession } = config;

router.get('/:ID/findCustomer', findCustomer);
router.get('/:ID/details', authenticateUserMiddleware, getUser);

router.get('/:ID/childDetails', authenticateUserMiddleware, getChildInfo);

router.post(
  '/:ID/updateChildInfo',
  authenticateUserMiddleware,
  updateChildInfo
);

router.post('/getChildrenList', authenticateUserMiddleware, getChildrenList);
router.post(
  '/getEmployeeList',
  authenticateUserMiddleware,
  listEmployeeController
);
router.post('/getCustomerList', authenticateUserMiddleware, listCustomer);
router.get('/getBarangayList', authenticateUserMiddleware, getBarangayList);

router.post(
  '/getDashboardDatePerBarangay',
  authenticateUserMiddleware,
  getDashboardDatePerBarangay
);

router.post(
  '/getReportPerBarangay',
  authenticateUserMiddleware,
  getReportPerBarangay
);

router.post('/create', authenticateUserMiddleware, createCustomerController);
router.post(
  '/createEmployee',
  authenticateUserMiddleware,
  createemployeeController
);

router.post(
  '/editEmployee',
  authenticateUserMiddleware,
  editEmployeeController
);
router.post(
  '/getOverallStatistics',
  authenticateUserMiddleware,
  getOverallStatistics
);

router.post(
  '/deleteChildRecord',
  authenticateUserMiddleware,
  deleteChildRecord
);

export default router;
