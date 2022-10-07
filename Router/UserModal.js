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

const loginUser = async (req, res, next) => {
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
        // do create jwt token and send to user
        const tokem = await jwt.sign({
            userId: userData._id
        }, process.env.JWT_SECRET)

        res.send({
            status: "Success",
            message: "User Authorized successfully",
            tokem
        })
    } else {
        res.status(400).send({
            status: "Errpr",
            message: "Email or Password Invallid"
        })
    }
}

const updateUserName = async (req, res, next) => {
    const { token, name} = req.body;

    

    try {
        const {userId} = await jwt.verify(token, process.env.JWT_SECRET);
        const updateUser = await UserModal.findByIdAndUpdate(userId, { name }, {
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
    console.log(userId)
}

userRouter.route("/addUser").post(createUser);
userRouter.route('/login').post(loginUser);
userRouter.route('/updateUserName').post(updateUserName);

module.exports = userRouter;
