const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userSchema = require("../Schema/userSchema");
const crypto = require('crypto');

const uri = process.env.DB_URL.replace("<PASSWORD>", process.env.DB_PASSWORD);
mongoose.connect(uri);
const UserModal = mongoose.model("user", userSchema);

const userRouter = express.Router();

const createUser = async (req, res, next) => {
  const { body } = req;
  // passing body directly -- security issue?

  try {
    const newUser = await UserModal.create({
      name: body.name,
      password: body.password,
      email: body.email,
      confirmPassword: body.confirmPassword,
    });
    res.status(201).send({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({
      status: "error",
      data: {
        error: e,
      },
    });
  }
};

const validatePasswrod = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).send({
      status: "Errpr",
      message: "Email or Password Invallid",
    });
  }

  const userData = await UserModal.findOne({
    email: email,
  }).select("+password"); // it will give password field

  if (!userData) {
    res.status(400).send({
      status: "Errpr",
      message: "Email or Password Invallid",
    });
  }

  const passwordMatch = await bcrypt.compare(password, userData.password);

  if (passwordMatch) {
    // call the next middleware
    // we can add any data into req object, Here i added user data into req object
    req.user = userData;
    next();
  } else {
    res.status(400).send({
      status: "Errpr",
      message: "Email or Password Invallid",
    });
  }
};

const protectRoute = async (req, res, next) => {
  const { authorization } = req.headers;
  console.log(authorization);
  const { userId } = await jwt.verify(authorization, process.env.JWT_SECRET);

  // 1. Whether user is present or not
  // We are now getting userId from token, so we need to check whether that user id is present of not
  const userData = await UserModal.findById(userId);

  if (!userData) {
    res.status(404).send({
      status: "error",
      message: "user not found",
    });
  }

  req.user = userData;

  // created a token after login and passed that token in headers
  // after i generated the token, i changed my password
  // for token, i need to keep some expiration time
  // also while changing password, i need to update time at which the passwor is changed
  // then i need to validate that time with token creation time
  // if token creation time is less that password reset time, token in invalid
  next();
};

const loginUser = async (req, res, next) => {
  const tokem = await jwt.sign(
    {
      userId: req.user._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  console.log(tokem);

  res.send({
    status: "Success",
    message: "User Authorized successfully",
    tokem,
  });
};

const updateUserName = async (req, res, next) => {
  const { name } = req.body;

  try {
    const updateUser = await UserModal.findByIdAndUpdate(
      req.user._id,
      { name },
      {
        runValidators: true,
        new: true,
      }
    );
    res.send({
      status: "success",
      message: "Uer Name updated successfully",
      document: updateUser,
    });
  } catch (e) {
    res.status(400).send({
      status: "Error",
      message: "Something went worng, pls try again after sometime",
    });
  }
};

const sendVerificationMail = async (req, res, next) => {
    // 1. get mail id from user and check whether that user email is matching with the id 
    // in the token
    // if mail id is matching, then send a reset token in the mail ..
    // if mail is not available --> No user found
    // if mail is not matching with id, then invalid 
    // we need to set reset token into db and also need to set expiration time
    console.log("Calling SendVerification email metod")

    const { email } = req.body;
    // make use of findOne method to get the userdata based on email
    // for id, we used findById and for other, we need to user findOne method
    console.log(req.user, email)

    // req.user.email is the email id extreacted from jwt token
    // we need to compare, given mail id matches with extreacted mail id
    if (req.user.email !== email) {
        res.status(403).send({
            message: "Email is invalid"
        })
    } else {
        // Create a reset token -- Random reset roken
        // save it in db, and then mail this reset token to user
        const resetToken = crypto.randomBytes(16).toString('hex');
        const complexToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        req.user.resetPasswordToken = complexToken;
        req.user.resetPasswordExpiresIn = Date.now() * 60;
        const updateUser = await UserModal.findByIdAndUpdate(req.user._id, {
            ...req.user
        }, {
            runValidators: false,
            new: true
        })
        console.log(updateUser);
        // send mail and then send response back

        res.send({
            message: "Rest Password mail has been sent",
            resetToken: resetToken,
            data: updateUser
        })
    }
    
    // https://mydomain.com/forgotPasswrod/RESET_TOKEN

    // 2. UI will extract RESET_TOKEN and then sends the NEW_PASSWORD to the setPasswrod
    // check received token is valid with dababase stored token

    // 3. if reset token matches and it is not expired, then proceed with updating the user password
    // send resettoken and save hashed token into db
    // compare resttokena dn hashedtoken
    // if comapriosn matches, procedd with updating new passwrod
    // also we need to check, reset otken expiry time





};

// Will public or protected one ?
// addUser would be expected to be a public -- public route
userRouter.route("/addUser").post(createUser);

// this also need to be public
userRouter.route("/login").post(validatePasswrod, loginUser);

// This need to be a private or protected route
userRouter.route("/updateUserName").post(protectRoute, updateUserName);

// password reset, did it be protectedRoute ?
// protectRoute can be replace with otp or security question check based on architecture
// remove the protectRoute and try to get email from req.bodu and then chec in db, whetehr emai lis presnet
userRouter.route("/resetPassword").post(protectRoute, sendVerificationMail);

module.exports = userRouter;
