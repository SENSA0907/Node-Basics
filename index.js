const http = require("http");
const url = require("url");
const math = require('./math');
const { reverse, sortBy } = require('lodash')

const students = [
  {
    id: 1,
    name: "senthil",
    class: "X!",
  },
  {
    id: 2,
    name: "nathan",
    class: "X!",
  },
  {
    id: 3,
    name: "vijay",
    class: "X!",
  },
  {
    id: 4,
    name: "Jefriya",
    class: "X!",
  },
];

const server = http.createServer((request, response) => {
  // console.log(request.method);
  const { query, pathname } = url.parse(request.url, true);
  console.log(math.product(5, 5))
  const arr = [12, 4,3,44, 5, 445,11]
  console.log(reverse(sortBy(arr)))
  // console.log(query, pathname);
  // most of the api's will return json data
  response.writeHead(200, {
    "Content-type": "application/json",
  });

  // using pathname, query and pathvariables we can write different routes
  // along with using Mehtods like POST PUT Delete or GET

  // NPM, what is dependencies, dev dependencies, 
  
  if (pathname === "/students" && query.id) {
    const filterStudent = students.find((student) => {
      return student.id == query.id;
    });
    if (filterStudent) {
      response.end(JSON.stringify(filterStudent));
    } else {
      response.end(JSON.stringify("No Student Data"));
    }
  } else if (pathname === "/students") {
    response.end(JSON.stringify(students));
  } else {
    response.end("Route not found");
  }

  // rarely we will send xml data

  // if node is used for server side webpage cration
  // response.end(`<div><button>Click Here</button></div>`)

  // in browser u can hit only GET method
  // GET --> To get some data from the server
  // POST --> POST is used to send some data to the server
  // PATCH, PUT --> It is again sending some data to server, but purpose would be updating
  // DELETE --> purpose would be deleting some thing
});

server.listen(3001);
