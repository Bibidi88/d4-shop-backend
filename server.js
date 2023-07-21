const http = require('http');
const app = require('./app');

const port = process.env.REQUEST_SERVER_PORT || 3000;

const server = http.createServer(app);

server.listen(port, () => console.log(`it's alive on http://localhost:${port}`));

