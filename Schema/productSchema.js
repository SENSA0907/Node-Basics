const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: String,
  titleSlug: String,
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
    select: true // restrict fields in schema also
  },
  id: {
    type: Number,
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
}, {
  toJSON: { virtuals: true }, // during document creation, we pass json format, so to get virtual property in json i added this line
  toObject: { virtuals: true } // when doc created, it will return us the object, so to inculude virtual property i added this
});

// save will work for both .create and .save mongoose methods
// this pre method is a document middleware and receives next as the function
// we need to use normal function as the second parameter
// don't use arrow function
productSchema.pre('save', function (next) {
  // this keyword here, refers to the corrent document we are passing
  // arrow function, do not have its own this keyword, 
  // that's why i used normal function
  // normal function always has access to the this keyword in javascript
  // console.log(this);
  this.titleSlug = this.title.replace(/ /g, '-');
  next();
})

// post save
productSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
})

// QUERY middleware
productSchema.pre(/^find/, function(next) {
  this.startTime = Date.now();
  this.find({
    isAvailable: false
  })
  console.log(this)
  next()
})


productSchema.post(/^find/, function(query, next) {
  const timeTaken = Date.now() - this.startTime;
  console.log('Time taken to execure query is ', timeTaken);
  next()
})


// Virtual Properties
// something which we cannot query but will present in the document
// date-of-birth --> age and need to store in document
// but user cannot do query operation based on age
// 1 january, 2 feb
// 0 sunday, 1 saturday

productSchema.virtual('priceInDollar').get(function(){
  return this.price / 80;
})

module.exports = productSchema;
