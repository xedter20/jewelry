import express from 'express';

import {
  addOrder,
  listOrder,
  makePayment
} from '../controllers/transactionController.js';

import { authenticateUserMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

import fs from 'fs-extra'; //npm install fs.extra

import multer from 'multer';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import config from '../config.js';

let firebaseStorage = config.firebaseStorage;

const { mySqlDriver } = config;
import { updateOrder } from '../cypher/order.js';
// const storage = multer.diskStorage({
//   destination: (req, file, callBack) => {
//     let path = 'public/uploads/transaction/';
//     fs.mkdirSync(path, { recursive: true });
//     callBack(null, path);
//   },
//   filename: (req, file, callBack) => {
//     callBack(null, `${file.originalname}`);
//   }
// });
// let upload = multer({ dest: 'public/uploads/transaction', storage });

// router.post('/approvedMatching', authenticateUserMiddleware, approvedMatching);

// router.post(
//   '/getDashboardStats',
//   authenticateUserMiddleware,
//   getDashboardStats
// );

const upload = multer({ storage: multer.memoryStorage() });

router.post('/addOrder', authenticateUserMiddleware, addOrder);

router.post('/listOrder', listOrder);

// router.post('/makePayment', upload.single('Proof_Payment'), makePayment);

router.post(
  '/makePayment',
  upload.single('Proof_Payment'),
  async (req, res) => {
    try {
      const file = req.file;

      let transactionId = req.body.TransactionID;

      const storageRef = ref(
        firebaseStorage,
        `transactions/${transactionId}/prof_of_payment/${file.originalname}`
      );
      const metadata = { contentType: file.mimetype };

      // Upload the file to Firebase Storage
      await uploadBytes(storageRef, file.buffer, metadata);

      // Get the file's download URL
      const downloadURL = await getDownloadURL(storageRef);

      await mySqlDriver.execute(
        updateOrder(transactionId, 'PAID', downloadURL)
      );

      res.status(200).json({ downloadURL });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
