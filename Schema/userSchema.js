const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User Name is mandatory"],
  },
  email: {
    type: String,
    required: [true, "Email is mandatory"],
  },
  password: {
    type: String,
    minlength: 8,
    required: [true, "Password is mandatory"],
    select: false
  },
  confirmPassword: {
    type: String,
    minlength: 8,
    required: [true, "Confirm Password is mandatory"],
    validate: {
      // validator need to return true or false
      // if it returns true, then document is valid and no error will be shown
      // if it returns false, then document is invalid and shows error
      validator: function (el) {
        return el === this.password;
      },
      message: "password and confirm password doesnot match",
    },
  },
});

userSchema.pre("save", async function (next) {
  // encrypt passwrod and save it into data base
  // also remove the confimrPassword field
  // 8 --> it wil less cpu memory to hash the password
  // 12 --> medium
  // 16 --> long time, but highely hashed
  this.password = await bcrypt.hash(this.password, 10);
  this.confirmPassword = undefined; // if any field is undefined, mongodb will omit that filed
  next();
});

module.exports = userSchema;
