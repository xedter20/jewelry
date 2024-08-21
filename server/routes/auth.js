import express from 'express';

import {
  // findUserByIdQuery,
  // addUserQuery,
  // createRelationShipQuery,
  // getTreeStructureQuery,
  // getChildren,
  findUserByEmailQuery,
  findUserByUserNameQuery,
  findUserQuery,
  updatePassword
} from '../cypher/user.js';

import config from '../config.js';

import { generateAccessToken } from '../helpers/generateAccessToken.js';

const { cypherQuerySession, mySqlDriver } = config;

const router = express.Router();

import jwt from 'jsonwebtoken';
import bycrypt from 'bcrypt';
import nodemailer from 'nodemailer';

router.post('/login', async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    var result = await mySqlDriver.query(findUserByEmailQuery(email));

    let user = result;

    console.log({ user });

    const foundUserByEmail = user.find(u => {
      return u.Username === email && u.Password === password;
    });

    console.log({ foundUserByEmail });
    if (foundUserByEmail) {
      let foundUser = {
        ...foundUserByEmail
      };
      let { email, EmployeeID, role } = foundUser;

      let token = await generateAccessToken({ email, EmployeeID, role });

      res.json({
        success: true,
        token: token,
        data: {
          role: foundUser.role,
          userId: foundUser.EmployeeID,
          email: foundUser.email
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'wrong_credentials'
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send('Something went wrong');
  }
});

router.post('/forgetPassword', async (req, res, next) => {
  try {
    // Find the user by email
    // const user = await User.findOne({ mail: req.body.email });

    let email = req.body.email;

    var user = await mySqlDriver.query(findUserByEmailQuery(email));

    console.log({ user });
    const foundUserByEmail = user.find(u => {
      return u.email === email;
    });

    // If user not found, send error message
    if (!foundUserByEmail) {
      res.status(401).json({
        success: false,
        message: 'Email is not registered in our system.'
      });
    } else {
      // Generate a unique JWT token for the user that contains the user's id
      const token = jwt.sign({ email: foundUserByEmail.email }, 'secret', {
        expiresIn: '10m'
      });

      // Send the token to the user's email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'mdexter958@gmail.com',
          pass: 'vcdi wrpw wjag fgbv'
        }
      });

      // Email configuration
      const mailOptions = {
        from: 'mdexter958@gmail.com',
        to: email,
        subject: 'Reset Password',
        html: `<h1>Reset Your Password</h1>
    <p>Click on the following link to reset your password:</p>
    <a href="http://localhost:5173/reset-password/${token}">http://localhost:5173/reset-password/${token}</a>
    <p>The link will expire in 10 minutes.</p>
    <p>If you didn't request a password reset, please ignore this email.</p>`
      };

      // Send the email
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          return res.status(500).send({ message: err.message });
        }
        res.status(200).send({ message: 'Email sent' });
      });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});
router.post('/reset-password/:token', async (req, res, next) => {
  try {
    // Verify the token sent by the user
    let newPassword = req.body.newPassword;
    const decodedToken = jwt.verify(req.params.token, 'secret');

    // If the token is invalid, return an error
    if (!decodedToken) {
      return res.status(401).send({ message: 'Invalid token' });
    }

    // find the user with the id from the token

    console.log(decodedToken.email);

    var user = await mySqlDriver.query(
      findUserByEmailQuery(decodedToken.email)
    );
    const foundUserByEmail = user.find(u => {
      return u.email === decodedToken.email;
    });

    console.log({ foundUserByEmail });
    // If user not found, send error message
    if (!foundUserByEmail) {
      res.status(401).json({
        success: false,
        message: 'Email is not registered in our system.'
      });
    } else {
      var user = await mySqlDriver.query(
        updatePassword(foundUserByEmail.email, newPassword)
      );
      res.status(200).send({ message: 'Password updated' });
    }

    // Hash the new password
    // const salt = await bycrypt.genSalt(10);
    // req.body.newPassword = await bycrypt.hash(req.body.newPassword, salt);

    // // Update user's password, clear reset token and expiration time
    // user.password = req.body.newPassword;
    // await user.save();

    // // Send success response
  } catch (err) {
    // Send error response if any error occurs
    res.status(500).send({ message: err.message });
  }
});

export default router;
