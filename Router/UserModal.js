const express = require("express");
const mongoose = require("mongoose");
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

userRouter.route("/addUser").post(createUser);

module.exports = userRouter;
