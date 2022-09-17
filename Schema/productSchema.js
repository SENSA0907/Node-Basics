const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: String,
  price: {
    type: Number,
    required: [true, "Price is mandatory"],
    min: [1, "Minimum value would be 100 for price"],
    default: 1
  },
  isAvailable: {
    type: Boolean,
    required: [true, "isAvailable field is required"],
    default: true,
    select: false // restrict fields in schema also
  },
  id: {
    type: Number,
    unique: [true, "id should be unique, try with different id"],
  },
  phone: {
    type: String,
    validate: {
      validator: function (v) {
        return /\d{3}-\d{3}-\d{4}/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
    required: [true, "User phone number required"],
    default: "111-111-1111"
  },
  name: {
    first: {
      type: String,
      trim: true, // only available for String
      required: [true, "First name is mandatory"],
      default: "first"
    },
    last: {
      type: String,
      default: " ",
    },
  },
  images: [String]
});

module.exports = productSchema;
