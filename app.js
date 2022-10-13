require("dotenv").config({
  path: process.env.NODE_ENV.trim() === "prod" ? "./prod.env" : "./dev.env",
});
const express = require("express");
const morgan = require("morgan");
const responseTime = require("response-time");
const rateLimit = require("express-rate-limit");
const { connectMongoDB } = require('./DB/database');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
/* const { MongoClient } = require("mongodb");
// Replace the uri string with your MongoDB deployment's connection string.
const uri = process.env.DB_URL.replace(
  "<PASSWORD>",
  process.env.DB_PASSWORD
);
console.log(uri)
const client = new MongoClient(uri);
async function run() {
  try {
    const database = client.db("");
    const haiku = database.collection("student");
    // create a document to insert
    const doc = {
      title: "Record of a Shriveled Datum",
      content: "No bytes, no problem. Just insert a document, in MongoDB",
    };
    const result = await haiku.insertOne(doc);
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } finally {
    await client.close();
  }
}
run().catch(console.dir); */

connectMongoDB();

const productRouter = require("./Router/ProductRouter");
const productRouterNew = require("./Router/ProductRouterNew");
const userRouter = require("./Router/UserModal");
const PORT = process.env.NODE_ENV.trim() === "prod" ? 5000 : 3001;
// const PROD_PORT = 5000;

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
// app.use(customMiddleware);
// 2nd middle ware
app.use(express.json());
// 3rd middleware
app.use(express.urlencoded({ extended: true }));
// 4th middleware
app.use(morgan("dev"));
// 5th middleware
app.use(responseTime());
// Rate Limiter
const limiter = rateLimit({
  windowMs: 10 * 1000, // 10 sec - have to give in milliseconds
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: true, // Disable the `X-RateLimit-*` headers
  message: "Please try after some time",
});
// 6th middleware
// This app.use is used to set rate limit middleware for all the routes below it
app.use(limiter);

app.use("/api/v1/products", productRouter);
app.use('/api/v2/products', productRouterNew);
app.use('/api/v2/users', userRouter);

// app.use('/api/v1/users', userRouter)

// process is a global object, which has data realted to your node and its environment variables
// environmental values are used to separate data between different phases of your application
// development, staging/QA/Testing, UAT/User Acceptence Test (Done by the client), prodcution ( End user )
console.log(process.env.NODE_ENV, process.env.DB_USERNAME);

app.listen(PORT, () => {
  console.log(`Listening to server on Port ${PORT}`);
});
