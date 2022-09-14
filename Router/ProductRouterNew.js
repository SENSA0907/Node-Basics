const express = require("express");
const MOCK_DATA = require("../mock");
const { validateAddProduct } = require("../Validation/productValidation");
const { getDB } = require("../DB/database");
const mongodb = require("mongodb");
const mongoose = require('mongoose');
const productSchema = require('../Schema/productSchema')

const uri = process.env.DB_URL.replace("<PASSWORD>", process.env.DB_PASSWORD);
mongoose.connect(uri);
const ProductModel = mongoose.model('product', productSchema);

// const data = MOCK_DATA.products;

// express.Router is used to create mini express application
const productRouter = express.Router();

const getProducts = (req, res) => {
  console.log(req.query, req.params);
  ProductModel.find({}).then((success)=>{
    console.log(success)
    res.send({ data: success})
  }).catch((err)=>{
    res.status(400).send(err)
  })
};

const postProduct = (req, res) => {
  // creating a model based on productSchema
  // The name of the model can br taken as collection name , if we won't provide in schema

  // create is used for adding an document into database collection
  ProductModel.create({
    ...req.body
  }).then((success)=>{
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
  })

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

const getProdct = async (req, res) => {
  console.log(req.query, req.params.productId);
  await ProductModel.findOne({_id: req.params.productId}).then((success)=>{
    console.log(success)
    res.send({ data: success})
  }).catch((err)=>{
    res.status(400).send(err)
  })
};

// what is middleware chaining
// adding multiple middleware for our routes

// Ex--> Adding validation related middleware for POST Product

productRouter.route("/").post(postProduct).get(getProducts);

productRouter
  .route("/:productId")
  .delete(deleteProduct)
  .put(updateProduct)
  .get(getProdct);

module.exports = productRouter;
