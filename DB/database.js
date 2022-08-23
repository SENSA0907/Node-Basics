const MongoClient  = require("mongodb").MongoClient;

const uri = process.env.DB_URL.replace("<PASSWORD>", process.env.DB_PASSWORD);

let db;

const connectDB = () => {
  // Promises can be resolved or rejected
  // resolved is success and reject is failure
  // then method for resolved and catch method for failure
  MongoClient.connect(uri)
    .then((client) => {
      // getDBConnection will hold a connection to the MyDataBase
      console.log("Connected to DB")
      db = client.db("MyDataBase");
      // console.log(getDBConnection)
      // console.log(client.db("MyDataBase"))
    })
    .catch((error) => {
      console.log(error);
    });
};

const getDBConnection = () => {
    if (db) {
        return db
    }
    throw "No DB Found"
}

module.exports = {
  connectMongoDB: connectDB,
  getDB: getDBConnection
};
