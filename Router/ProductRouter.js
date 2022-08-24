const express = require("express");
const MOCK_DATA = require("../mock");
const { validateAddProduct } = require("../Validation/productValidation");
const { getDB } = require("../DB/database");
const mongodb = require("mongodb");

// const data = MOCK_DATA.products;

// express.Router is used to create mini express application
const productRouter = express.Router();

const getProducts = (req, res) => {
  console.log(req.query, req.params);
  const db = getDB();
  db.collection("product")
    .find()
    .toArray()
    .then((data) => {
      res.json({
        data: data,
        results: data.length,
        requestedAt: req.requestedTime,
        respondedAt: Date.now(),
        timeTaken: Date.now() - req.requestedTime,
      });
    })
    .catch((error) => {
      res.json({
        ...error,
        errorMessage: "Unable to find data",
      });
    });
};

const postProduct = (req, res) => {
  // console.log(req.body);
  data.push({ ...req.body, id: data.length + 1 });
  // calling getDB() method, will give us connection to the connected DB
  const db = getDB();

  // db.collection method will connect us to the collection we provide
  // if product collection is present, it will use that or else it will create the collection
  db.collection("product")
    .insertOne({ ...req.body })
    .then((success) => {
      console.log(success);
      // console.log(mongodb.ObjectId(success.insertedId))
      res.status(201).json({
        ...success,
        data: req.body,
      });
    })
    .catch((error) => {
      res.status(404).json({
        ...error,
      });
      console.log(error);
    });
};

const deleteProduct = (req, res) => {
  console.log(req.query, req.params.productId);
  /* const index = data.findIndex((elem) => {
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
  } */
  const db = getDB();
  db.collection('product').deleteOne({
    _id: mongodb.ObjectId(req.params.productId)
  }).then((deletedData)=>{
    res.json({
      data: deletedData
    })
  }).catch((error)=>{
    res.status(404).json({
      ...error,
      errorMessage: "No id present to delete"
    })
  })
};

const updateProduct = (req, res) => {
  console.log(req.query, req.params.productId);
  /* const index = data.findIndex((elem) => {
    return elem.id == req.params.productId;
  });
  if (index !== -1) {
    data[index] = { ...data[index], ...req.body };
    res.json({
      message: "Updated",
    });
  } else {
    res.json({
      message: "Requested data not found",
    });
  } */
  const db = getDB();
  db.collection('product').updateOne({
    _id: mongodb.ObjectId(req.params.productId)
  }, {
    $set: {
      ...req.body
    }
  }).then((updatedData)=>{
    res.json({
      data: updatedData
    })
  }).catch((error)=>{
    res.status(404).json({
      ...error,
      errorMessage: "some error while updating"
    })
  })
};

const getProdct = (req, res) => {
  console.log(req.query, req.params.productId);
  /* const filteredProduct = data.find((elem) => {
    return elem.id == req.params.productId;
  });
  res.status(filteredProduct ? 200 : 404).json({
    data: filteredProduct ? filteredProduct : "No Data Found",
    requestedAt: Date.now(),
  }); */
  const db = getDB();
  db.collection('product').findOne({
    _id: mongodb.ObjectId(req.params.productId)
  }).then((successData)=>{
    res.json({
      data: successData
    })
  }).catch((error)=>{
    res.status(404).json({
      ...error,
      errorMessage: "No matched data found in db"
    })
  })
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
