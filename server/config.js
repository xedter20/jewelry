import dotenv from 'dotenv';
import assert from 'assert';

import neo4j from 'neo4j-driver';
import mysql from 'mysql2/promise';

import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

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

let firebaseStorage;

try {
  // console.log({ NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD });
  // driver = neo4j.driver(
  //   NEO4J_URI,
  //   neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD),
  //   {
  //     connectionTimeout: 0
  //   }
  // );

  // getDbConnection = async () => {
  //   return await mysql.createConnection({
  //     host: 'junction.proxy.rlwy.net',
  //     user: 'root',
  //     password: 'VWMwIQdNYrLnjBGoYbkLvvpzRwjVczSp',
  //     database: 'railway',
  //     port: 34231
  //   });
  // };

  getDbConnection = async () => {
    return await mysql.createConnection({
      host: 'us-cluster-east-01.k8s.cleardb.net',
      user: 'b828180a13a6f7',
      password: '4c4f1b87',
      database: 'heroku_2f0733fc1ed4d7a',
      port: 3306
    });
  };

  // getDbConnection = async () => {
  //   return await mysql.createConnection({
  //     host: 'localhost',
  //     user: 'root',
  //     password: '',
  //     database: 'av_de_asis',
  //     port: 3306
  //   });
  // };

  mySqlDriver = await getDbConnection();

  // Your Firebase configuration
  const firebaseConfig = {
    apiKey: 'AIzaSyAln9KogkLpr_eMbBLlnQfMae7Ji380phQ',
    authDomain: 'avdeasis-4b5c7.firebaseapp.com',
    projectId: 'avdeasis-4b5c7',
    storageBucket: 'avdeasis-4b5c7.appspot.com',
    messagingSenderId: '563212793374',
    appId: '1:563212793374:web:4a5f5dd187e0304661a00f',
    measurementId: 'G-5LTWLEWR22'
  };

  //mysql://b828180a13a6f7:4c4f1b87@us-cluster-east-01.k8s.cleardb.net/heroku_2f0733fc1ed4d7a?reconnect=true
  // Username: b828180a13a6f7
  // Password: 4c4f1b87
  // Host: us-cluster-east-01.k8s.cleardb.net
  // change date NOT NULL DEFAULT current_timestamp() to TIMESTAMP DEFAULT CURRENT_TIMESTAMP

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  firebaseStorage = getStorage(app);

  // console.log({ firebaseStorage });
  console.log('DBs Connected');
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
  mySqlDriver: mySqlDriver,
  firebaseStorage
};
