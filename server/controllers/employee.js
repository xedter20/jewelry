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
  findUserByEmailQuery,
  findUserByUserNameQuery,
  findUserQuery
} from '../cypher/user.js';

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

export const createemployeeController = async (req, res, next) => {
  try {
    let data = req.body;

    console.log({ data });

    let adminEmail = req.user.email;

    var [result] = await mySqlDriver.query(findUserByEmailQuery(adminEmail));

    data.adminFullName = `${result.Admin_Fname} ${result.Admin_Lname}`;
    await mySqlDriver.query(createOrMergeEmployee(data));

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};

export const editEmployeeController = async (req, res, next) => {
  try {
    let data = req.body;

    console.log({ data });

    // let adminEmail = req.user.email;

    // var [result] = await mySqlDriver.query(findUserByEmailQuery(adminEmail));

    // data.adminFullName = `${result.Fname} ${result.Lname}`;
    await mySqlDriver.query(updateEmployee(data.EmployeeID, data), [
      data,
      data.EmployeeID
    ]);

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};

export const listEmployeeController = async (req, res, next) => {
  try {
    let ID = req.params.ID;

    var result = await mySqlDriver.query(getEmployeeList());

    res.json({ success: true, data: result });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};
