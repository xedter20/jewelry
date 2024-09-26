import config from '../config.js';

import { createOrder, getOrderList } from '../cypher/order.js';

import { v4 as uuidv4 } from 'uuid';
import { child } from 'firebase/database';

const {
  cypherQuerySession,
  mySqlDriver,
  cypherQuerySessionDriver,
  defaultDBName
} = config;

export const addOrder = async (req, res, next) => {
  try {
    let loggedInUser = req.user;

    let data = req.body;

    let adminEmail = req.user.email;

    let adminUserID = req.user.email;

    data.adminUserID = adminUserID;
    await mySqlDriver.execute(createOrder(data));

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};
export const listOrder = async (req, res, next) => {
  try {
    let customerId = req.body.customerId;
    let transactionId = req.body.transactionId;

    var [result] = await mySqlDriver.execute(
      getOrderList(customerId, transactionId)
    );

    res.json({ success: true, data: result });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};

export const makePayment = async (req, res, next) => {
  try {
    // let customerId = req.body.customerId;
    let transactionId = req.body.TransactionID;

    let uploadPath = req.body.data;
    let filename = req.file.filename;

    // fs.move('../tempDir/' + fileName, '../tempDir/' + dir + '/' + fileName, function (err) {
    //     if (err) {
    //         return console.error(err);
    //     }

    //     res.json({});
    // });

    console.log({
      transactionId,
      uploadPath,
      filename
    });

    // var [result] = await mySqlDriver.execute(
    //   getOrderList(customerId, transactionId)
    // );

    // res.json({ success: true, data: result });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};
