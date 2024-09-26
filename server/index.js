import express from 'express';
import cors from 'cors';

import config from './config.js';

import userRoute from './routes/userRoute.js';
import authRoute from './routes/auth.js';
import supplierRoute from './routes/supplier.js';
import transactionRoute from './routes/transactionRoute.js';

import admintransactionRoute from './routes/admin/transactionRoute.js';
import bodyParser from 'body-parser';
import codeRoute from './routes/codeRoute.js';
import featureListRoute from './routes/featureListRoute.js';
// import * as initDBScripts from './scripts/initDB.js';

// import { dailyProfitScheduleJob } from './helpers/dailyProfitScheduleJob.js';
// import { codeTypeRepo } from './repository/codeType.js';

import payoutRoute from './routes/payoutRoute.js';
import adminPayoutRoute from './routes/admin/payoutRoute.js';

import path from 'path';
import { fileURLToPath } from 'url';
// const { cypherQuerySession } = config;
// import { mergeUserQuery } from './cypher/child.js';
// import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const app = express();

// for parsing application/json
app.use(
  bodyParser.json({
    limit: '50mb'
  })
);
// for parsing application/xwww-form-urlencoded
app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true
  })
);

app.use(bodyParser.json({ limit: '50mb' }));
app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 1000000
  })
);

app.use(cors());
app.use(express.json());

//routes
app.get('/', (req, res, next) => {
  res.json('Hello from server');
});
app.use('/api/user', userRoute);

app.use('/api/auth', authRoute);

app.use('/api/supplier', supplierRoute);

app.use('/api/transactions', transactionRoute);

app.use('/api/admin/transactions', admintransactionRoute);
app.use('/api/code', codeRoute);
app.use('/api/featureList', featureListRoute);
app.use('/api/payout', payoutRoute);
app.use('/api/admin/payout', adminPayoutRoute);

app.use(express.static('public'));
app.use(express.static('files'));

app.use('/static', express.static('public'));
// app.use('/', async (req, res, next) => {
//   res.json('Hello from server');
// });

app.listen(config.port, async () => {
  console.log(`Server is live`);
  console.log(config.port);

  // config.mySqlDriver.execute(
  //   'SELECT * FROM user_account',
  //   function (err, result, fields) {
  //     if (err) throw err;
  //     console.log(result);
  //   }
  // );

  // const result = await excelToJson({
  //   sourceFile: 'file.xlsx',
  //   sheets: ['Nut_StatusTool'],
  //   header: {
  //     // Is the number of rows that will be skipped and will not be present at our result object. Counting from top to bottom
  //     rows: 9 // 2, 3, 4, etc.
  //   },
  //   columnToKey: {
  //     A: 'Child Seq',
  //     B: 'Address or Location',
  //     C: 'Name of Mother/Caregiver',
  //     D: 'Full Name of Child',
  //     E: 'Belongs to IP Group',
  //     F: 'Sex',
  //     G: 'Date of Birth',
  //     H: 'Date Measured',
  //     I: 'Weight',
  //     J: 'Height',
  //     K: 'Age in Months',
  //     L: 'Weight for Age Status',
  //     M: 'Height for Age Status',
  //     N: 'Weight for Lt/Ht Status'
  //   }
  // });

  // let mappedKey = {
  //   'Child Seq': 'Child_Seq',
  //   'Address or Location': 'Address_or_Location',
  //   'Name of Mother/Caregiver': 'Name_of_Mother_or_Caregiver',
  //   'Full Name of Child': 'Full_Name_of_Child',
  //   'Belongs to IP Group': 'Belongs_to_IP_Group',
  //   Sex: 'Sex',
  //   'Date of Birth': 'Date_of_Birth',
  //   'Date Measured': 'Date_Measured',
  //   Weight: 'Weight',
  //   Height: 'Height',
  //   'Age in Months': 'Age_in_Months',
  //   'Weight for Age Status': 'Weight_for_Age_Status',
  //   'Height for Age Status': 'Height_for_Age_Status',
  //   'Weight for Lt/Ht Status': 'Weight_for_Lt_or_Ht_Status'
  // };
  // let arrayList = result.Nut_StatusTool.filter(i => !!i['Full Name of Child']);

  // let res = await Promise.all(
  //   arrayList.map(async props => {
  //     let childInfoProps = Object.keys(props).reduce((acc, currentKey) => {
  //       let updatedKey = mappedKey[currentKey];
  //       return {
  //         ...acc,
  //         ['Date_of_Birth']: Date.parse(props['Date of Birth']),
  //         ['Date_Measured']: Date.parse(props['Date Measured']),
  //         [updatedKey]: props[currentKey]
  //       };
  //     }, {});

  //     var { records } = await cypherQuerySession.executeQuery(
  //       mergeUserQuery({
  //         ...childInfoProps,
  //         date_created: Date.now(),
  //         ID: uuidv4(),
  //         lastName: childInfoProps['Full_Name_of_Child'].split(',')[0]
  //       })
  //     );

  //     return childInfoProps;
  //   })
  // );

  //  let approvalLink = `${config.hostUrl}/api/code/approveConfirmationLink`;
  // await initDBScripts.initDB();
  // await dailyProfitScheduleJob();
  // console.log({
  //   NEO4J_URI: process.env.NEO4J_URI,
  //   NEO4J_PASSWORD: process.env.NEO4J_PASSWORD
  // });
  //match (n:User) where not (n)--() set n.parentID = '' return n
});
