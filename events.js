// requiring events module
const EventEmitter = require("events");
const http = require("http");
const fs = require("fs");

// creating a EventEmitter
const requestEmitter = new EventEmitter();

// Handler for "startEvent"
const requestHandler = () => {
  console.log("THis is a custom event handler");
};

// Making the event emitter to listen to some Named Events
requestEmitter.on("startEvent", requestHandler);

// Triggering or emitting Named Events
requestEmitter.emit("startEvent");

// Creating event emitter for http
const server = http.createServer();

server.on("request", (req, res) => {
  console.log("I'm listening to http request");
  console.log(req.url);
  // asyncronous file read, bcoz we need to do non blocking code
  /* fs.readFile('./data.txt', (err, data)=>{
    if (err) console.log(err);
    res.end(data)
  }) */
  // stream methods
  /* let count = 0;
  const filewriteStream = fs.createReadStream("./data.txt");


  filewriteStream.on("data", (chunk) => {
    console.log(`${count} --- ${chunk}`);
    count = count + 1;
    res.write(chunk);
  })

  filewriteStream.on("end", ()=>{
    res.end()
  })
  filewriteStream.on("error", ()=> {
    console.log("some error happened");
    res.end("File not found")
  }) */
  const filewriteStream = fs.createReadStream("data.txt");
  let count = 0;
 
  filewriteStream.on("data", chunk => {
    // console.log(`${count} --- ${chunk}`);
    console.log(`chunk received ${count}`)
    count = count + 1;
    res.write(`${count}`);
  })

  filewriteStream.on("end", ()=>{
    res.end()
  })
  filewriteStream.on("error", ()=> {
    console.log("some error happened");
    res.end("File not found")
  })
  // filewriteStream.pipe(res)
  console.log(count)
});

server.on("request", (req, res) => {
  console.log("I'm listening to http request again ");
  console.log(req.url);
});

server.listen(3000, () => {
  console.log("Server Started");
});
