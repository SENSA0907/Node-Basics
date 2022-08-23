const express = require("express");
const MOCK_DATA = require("../mock");
const { validateAddProduct } = require("../Validation/productValidation");
const { getDB } = require("../DB/database");
const mongodb = require('mongodb');

const data = MOCK_DATA.products;

// express.Router is used to create mini express application
const productRouter = express.Router();

const getProducts = (req, res) => {
  console.log(req.query, req.params);
  res.json({
    data: data,
    results: data.length,
    requestedAt: req.requestedTime,
    respondedAt: Date.now(),
    timeTaken: Date.now() - req.requestedTime,
  });
};

const postProduct = (req, res) => {
  // console.log(req.body);
  data.push({ ...req.body, id: data.length + 1 });
  const db = getDB();
  db.collection("product")
    .insertOne({ ...req.body, id: data.length + 1 })
    .then((success) => {
      console.log(success);
      console.log(mongodb.ObjectId(success.insertedId))
      res.status(201).json({
        ...success,
        data: req.body,
      });
    });
  
};

const deleteProduct = (req, res) => {
  console.log(req.query, req.params.productId);
  const index = data.findIndex((elem) => {
    return elem.id == req.params.productId;
  });
  console.log(index);
  if (index !== -1) {
    data.splice(index, 1);
    res.status(204).json({
      status: "Removed",
    });
  } else {
    res.json({
      message: "Requested Id is not found",
    });
  }
};

const updateProduct = (req, res) => {
  console.log(req.query, req.params.productId);
  const index = data.findIndex((elem) => {
    return elem.id == req.params.productId;
  });
  if (index !== -1) {
    data[index] = { ...data[index], ...req.body };
    res.status(204).json({
      message: "Updated",
    });
  } else {
    res.json({
      message: "Requested data not found",
    });
  }
};

const getProdct = (req, res) => {
  console.log(req.query, req.params.productId);
  const filteredProduct = data.find((elem) => {
    return elem.id == req.params.productId;
  });
  res.json({
    data: filteredProduct ? filteredProduct : "No Data Found",
    requestedAt: Date.now(),
  });
};

// what is middleware chaining
// adding multiple middleware for our routes

// Ex--> Adding validation related middleware for POST Product

productRouter.route("/").post(validateAddProduct, postProduct).get(getProducts);

productRouter
  .route("/:productId")
  .delete(deleteProduct)
  .put(updateProduct)
  .get(getProdct);

module.exports = productRouter;
