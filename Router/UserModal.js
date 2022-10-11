const express = require("express");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const userSchema = require("../Schema/userSchema");

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
            message: "Email or Password Invallid"
        })
    }

    const userData = await UserModal.findOne({
        email: email
    }).select('+password') // it will give password field

    if (!userData) {
        res.status(400).send({
            status: "Errpr",
            message: "Email or Password Invallid"
        })
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
            message: "Email or Password Invallid"
        })
    }
}

const protectRoute = async (req, res, next) => {
    const { authorization } = req.headers;
    console.log(authorization);
    const {userId} = await jwt.verify(authorization, process.env.JWT_SECRET);

    // 1. Whether user is present or not
    // We are now getting userId from token, so we need to check whether that user id is present of not
    const userData = await UserModal.findById(userId);

    if (!userData) {
        res.status(404).send({
            status: "error",
            message: "user not found"
        })
    }

    req.user = userData;

    // created a token after login and passed that token in headers
    // after i generated the token, i changed my password
    // for token, i need to keep some expiration time
    // also while changing password, i need to update time at which the passwor is changed
    // then i need to validate that time with token creation time
    // if token creation time is less that password reset time, token in invalid
    next();
}

const loginUser = async (req, res, next) => {
    const tokem = await jwt.sign({
        userId: req.user._id
    }, process.env.JWT_SECRET, { expiresIn: '1h' })

    console.log(tokem)

    res.send({
        status: "Success",
        message: "User Authorized successfully",
        tokem
    })
}

const updateUserName = async (req, res, next) => {
    const { name} = req.body;

    

    try {
        const updateUser = await UserModal.findByIdAndUpdate(req.user._id, { name }, {
            runValidators: true,
            new: true
        })
        res.send({
            status: "success",
            message: "Uer Name updated successfully",
            document: updateUser
        })
        
    } catch(e) {
        res.status(400).send({
            status: "Error",
            message: "Something went worng, pls try again after sometime"
        })
    }
}

// Will public or protected one ?
// addUser would be expected to be a public -- public route
userRouter.route("/addUser").post(createUser);

// this also need to be public
userRouter.route('/login').post(validatePasswrod, loginUser);

// This need to be a private or protected route
userRouter.route('/updateUserName').post(protectRoute, updateUserName);

module.exports = userRouter;
