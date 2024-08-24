import dotenv from 'dotenv';
import assert from 'assert';

import neo4j from 'neo4j-driver';
import mysql from 'mysql2/promise';

//import mysql from 'promise-mysql';
dotenv.config();

const {
  PORT,
  HOST,
  HOST_URL,
  API_KEY,
  AUTH_DOMAIN,
  PROJECT_ID,
  STORAGE_BUCKET,
  MESSAGING_SENDER_ID,
  APP_ID,
  JWT_TOKEN_SECRET,
  NEO4J_URI,
  NEO4J_USER,
  NEO4J_PASSWORD,
  SENDGRID_API_KEY,
  DATABASE_URL
} = process.env;
let mySqlDriver;
let driver;
var connection;
var getDbConnection;

try {
  // console.log({ NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD });
  // driver = neo4j.driver(
  //   NEO4J_URI,
  //   neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD),
  //   {
  //     connectionTimeout: 0
  //   }
  // );

  getDbConnection = async () => {
    return await mysql.createConnection({
      host: 'junction.proxy.rlwy.net',
      user: 'root',
      password: 'VWMwIQdNYrLnjBGoYbkLvvpzRwjVczSp',
      database: 'railway',
      port: 34231
    });
  };

  mySqlDriver = await getDbConnection();

  // console.log(mySqlDriver.query);

  // connection = mysql.createConnection({
  //   host: '127.0.0.1',
  //   user: 'root',
  //   password: '',
  //   database: 'children_health_db'
  // });

  // mySqlDriver = connection.connect(function (err) {
  //   if (err) throw err;
  //   console.log('MySQL DB Connection established');

  //   // return connection;
  //   // connection.query(sql, function (err, result) {
  //   //   if (err) throw err;
  //   //   console.log('Result: ' + result);
  //   // });
  // });

  console.log('DB Connected');
} catch (err) {
  console.log(`Connection error\n${err}\nCause: ${err.cause}`);
}

let cypherQuerySession = `1`;

// let session = driver.session({ database: 'neo4j' });

// let cypherQuerySessionDriver = session;

// assert(PORT, 'Port is required');
// assert(HOST, 'Host is required');
// config
//config
export default {
  port: PORT,
  host: HOST,
  hostUrl: HOST_URL,
  firebaseConfig: {
    apiKey: 'AIzaSyC0VFvsZIq2XFtAatvfsiiA1ZT3Vzmcf8Y',
    authDomain: 'entrep-system.firebaseapp.com',
    projectId: 'entrep-system',
    storageBucket: 'entrep-system.appspot.com',
    messagingSenderId: '454615667579',
    appId: '1:454615667579:web:e265ff3388db8e9e9823de',
    measurementId: 'G-62HCJN3SH9'
  },
  cypherQuerySession,
  JWT_TOKEN_SECRET,
  SENDGRID_API_KEY,
  cypherQuerySessionDriver: '',
  defaultDBName: 'neo4j',
  mySqlDriver: mySqlDriver
};
