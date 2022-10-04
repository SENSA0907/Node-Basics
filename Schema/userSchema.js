const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User Name is mandatory"],
  },
  email: {
    type: String,
    required: [true, "Email is mandatory"],
    unique: true,
  },
  password: {
    type: String,
    minlength: 8,
    required: [true, "Password is mandatory"],
  },
  confirmPassword: {
    type: String,
    minlength: 8,
    required: [true, "Confirm Password is mandatory"],
  },
});

userSchema.pre("save", function (next) {
  if (this.password !== this.confirmPassword) {
    next();
  } else
    // encrypt passwrod and save it into data base
    // also remove the confimrPassword field

    this.confirmPassword = undefined; // if any field is undefined, mongodb will omit that filed
  next();
});

module.exports = userSchema;
