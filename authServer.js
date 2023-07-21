
const http = require('http');
const app = require('./authApp');


const port = process.env.AUTH_SERVER_PORT || 2000;

const server = http.createServer(app);

server.listen(port, () =>
  console.log(`it's alive on http://localhost:${port}`)
);
