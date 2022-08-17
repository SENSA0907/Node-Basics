const MOCK_DATA = require("./mock");
const express = require("express");
const morgan = require("morgan");
const responseTime = require("response-time");
const rateLimit = require('express-rate-limit')

const data = MOCK_DATA.products;
const PORT = 3001;

const app = express();

// it is an example of express middleware
// to add any middleware, make use of app.use from express

// own middleware

const customMiddleware = (req, res, next) => {
  console.log("This is coustom middleware");
  req.requestedTime = Date.now();
  if (req.query.isAdmin == "false") {
    return res
      .status(404)
      .json({ message: "you are not authorized to hit this route" });
  }
  next();
};
// 1st middle
app.use(customMiddleware);
// 2nd middle ware
app.use(express.json());
// 3rd middleware
app.use(express.urlencoded({ extended: true }));
// 4th middleware
app.use(morgan("dev"));

// Rate Limiter
const limiter = rateLimit({
	windowMs: 10 * 1000, // 10 sec - have to give in milliseconds
	max: 1, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: true, // Disable the `X-RateLimit-*` headers
  message: "Please try after some time"
})
// This app.use is used to set rate limit middleware for all the routes below it
app.use(limiter);

const oneLimit = rateLimit({
	windowMs: 15 * 10 * 1000, // 10 sec - have to give in milliseconds
	max: 1, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})


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
  res.status(201).json({
    data: req.body,
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

/* app.get("/api/v1/products", getProducts);
app.post("/api/v1/products", postProduct); */
app.route("/api/v1/products").post(postProduct).get(getProducts);
// 5th middleware
app.use(responseTime());
/* app.delete(`/api/v1/products/:productId`, deleteProduct);
app.put(`/api/v1/products/:productId`, updateProduct);
app.get(`/api/v1/products/:productId`, getProdct); */
app
  .route("/api/v1/products/:productId")
  .delete(deleteProduct)
  .put(updateProduct)
  .get(getProdct);
app.listen(PORT, () => {
  console.log(`Listening to server on Port ${PORT}`);
});

console.log(data.length);
