const express = require("express");
const MOCK_DATA = require("../mock");
const mongoose = require("mongoose");
const productSchema = require("../Schema/productSchema");

const uri = process.env.DB_URL.replace("<PASSWORD>", process.env.DB_PASSWORD);
mongoose.connect(uri);
const ProductModel = mongoose.model("product", productSchema);

const data = MOCK_DATA.products;

// express.Router is used to create mini express application
const productRouter = express.Router();

const postProductS = (req, res) => {
  // creating a model based on productSchema
  // The name of the model can br taken as collection name , if we won't provide in schema

  // create is used for adding an document into database collection
  ProductModel.create(data)
    .then((success) => {
      res.send({
        message: "all data stored successful",
      });
      console.log("product added using monggose");
    })
    .catch((err) => {
      res.status(400).send({
        message: "Something went wrong",
        error: err,
      });
    });
};

const getProductSummary = async (req, res) => {
  try {
    const productSumaryData = await ProductModel.aggregate([
      {
        $match: {
          // isAvailable: true,
          price: { $gte: 100}
        },
      },
      {
        $sort: { price: 1}
      },
      {
        $group: {
          _id: '$price',
          avgPrice: { $avg: '$price'},
          total: { $sum: '$price'},
          count: { $sum: 1 },
          maxPrice: { $max: '$price'},
          minPrice: { $min: '$price'},
          products: { $push: '$title'},
        }
      }
    ]);

    // const finddata = await ProductModel.find({});

    res.send({
      data: productSumaryData,
    });
  } catch (e) {
    console.log(e);
  }
};

const getProducts = (req, res) => {
  console.log(req.query, req.params);
  const excludeQuery = ["sort", "select", "title", "limit"];

  const queryCopy = { ...req.query };
  excludeQuery.forEach((e) => {
    delete queryCopy[e];
  });

  let queryCopyString = JSON.stringify(queryCopy); //object to string

  queryCopyString = queryCopyString.replace(
    /\b(gt|gte|lt|lte|regex)\b/g,
    (matchedString) => `$${matchedString}`
  );
  const sortQuery = req.query.sort ? req.query.sort.split(",").join(" ") : "";
  const selectQuery = req.query.select
    ? req.query.select.split(",").join(" ")
    : "";
  const titleSearchPattern = new RegExp(req.query.title, "i"); // i here stands for ignore case
  console.log(titleSearchPattern);

  // Sorting - based on some filed, i need to do asc or des the results
  // Field select - Selecting particular fields
  // pagination - 1000s of daa, then pagination helps in getting limited data
  // Advance Filtering --
  ProductModel.find({
    ...JSON.parse(queryCopyString),
    title: {
      $regex: titleSearchPattern, // search based filter
    },
  })
    .sort(sortQuery)
    .select(selectQuery)
    .limit(req.query.limit || 5)
    .then((success) => {
      // console.log(success)
      res.send({ data: success });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

const postProduct = (req, res) => {
  // creating a model based on productSchema
  // The name of the model can br taken as collection name , if we won't provide in schema

  // create is used for adding an document into database collection
  ProductModel.create({
    ...req.body,
  })
    .then((success) => {
      res.send({
        message: "saved successful",
        data: success,
      });
      console.log("product added using monggose");
    })
    .catch((err) => {
      res.status(400).send({
        message: "Something went wrong",
        error: err,
      });
    });

  // create model
  // then do save using model
  // create dcument
  /* const myDoc = ProductModel({
    ...req.body
  });
  myDoc.save().then((success)=>{
    res.send({
      message: "saved successful",
      data: success
    })
    console.log("product added using monggose")
  }).catch((err)=>{
    res.status(400).send({
      message: "Something went wrong",
      error: err
    })
  }) */
};

const deleteProduct = async (req, res) => {
  console.log(req.query, req.params.productId);
  await ProductModel.findByIdAndDelete(req.params.productId)
    .then((deletedData) => {
      res.json({
        data: deletedData,
      });
    })
    .catch((err) => {
      res.status(404).json({
        ...err,
        errorMessage: "No id present to delete",
      });
    });
};

const updateProduct = async (req, res) => {
  // console.log(req.query, req.params.productId);
  await ProductModel.findByIdAndUpdate(req.params.productId, req.body, {
    new: true,
    runValidators: true,
  })
    .then((success) => {
      console.log(success);
      res.send({ data: success });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

const getProdct = async (req, res) => {
  console.log(req.query, req.params.productId);
  await ProductModel.findOne({ _id: req.params.productId })
    .then((success) => {
      console.log(success);
      res.send({ data: success });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

// what is middleware chaining
// adding multiple middleware for our routes

// Ex--> Adding validation related middleware for POST Product

productRouter.route("/").post(postProduct).get(getProducts);
productRouter.route("/add").post(postProductS);
productRouter.route("/productSummary").get(getProductSummary);

productRouter
  .route("/:productId")
  .delete(deleteProduct)
  .put(updateProduct)
  .get(getProdct);

module.exports = productRouter;
