import {
  getAllChildren,
  getBrgyList,
  getAllChildrenPerBarangay,
  getChildInfoDetails,
  updateChildInfoDetails
} from '../cypher/child.js';

import {
  // findUserByIdQuery,
  // addUserQuery,
  // createRelationShipQuery,
  // getTreeStructureQuery,
  // getChildren,
  getSupplierList,
  createSupplier,
  updateSupplier,
  createSupplierPayment,
  getSupplierPaymentHistory
} from '../cypher/supplier.js';

import ShortUniqueId from 'short-unique-id';
import excelToJson from 'convert-excel-to-json';
import config from '../config.js';

import {
  getEmployeeList,
  createOrMergeEmployee,
  updateEmployee
} from '../cypher/employee.js';
const {
  cypherQuerySession,
  mySqlDriver,
  cypherQuerySessionDriver,
  defaultDBName
} = config;
import { findUserByEmailQuery } from '../cypher/user.js';
export const createSupplierController = async (req, res, next) => {
  try {
    let data = req.body;
    let adminEmail = req.user.email;
    var [result] = await mySqlDriver.execute(findUserByEmailQuery(adminEmail));

    data.adminFullName = `${result.Admin_Fname} ${result.Admin_Lname}`;

    var [result] = await mySqlDriver.execute(createSupplier(data));

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};

export const listSupplierController = async (req, res, next) => {
  try {
    let ID = req.params.ID;

    var [result] = await mySqlDriver.execute(getSupplierList());

    res.json({ success: true, data: result });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};

export const listSupplierPaymentHistory = async (req, res, next) => {
  try {
    let { SupplierID } = req.body;

    var [result] = await mySqlDriver.execute(
      getSupplierPaymentHistory(SupplierID)
    );
    //http://localhost:5000/static/uploads/Log%20In%20Page.png.png
    console.log({ result });
    res.json({
      success: true,
      data: result.map(({ Proof_Payment, ...data }) => {
        return {
          ...data,
          Proof_Payment: `http://localhost:5000/static/uploads/${Proof_Payment}`
        };
      })
    });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};

export const uploadFile = async (req, res, next) => {
  try {
    const file = req.file;

    console.log({ file });
    let data = req.body;

    let adminEmail = req.user.email;
    var [result] = await mySqlDriver.execute(findUserByEmailQuery(adminEmail));

    data.Admin_Fname = `${result.Admin_Fname} ${result.Admin_Lname}`;
    data.Proof_Payment = file.filename;
    await mySqlDriver.execute(createSupplierPayment(data));

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};
