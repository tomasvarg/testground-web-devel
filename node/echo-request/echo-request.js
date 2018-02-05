/**
 * A simple service just echoes received data
 *
 * usage: node echorequest.js [port=3001]
 */

const http = require('http');

const hostname = '0.0.0.0';
const port = process.argv[2] || 3001;

const server = http.createServer(function (req, res) {
  console.log(`\n${req.method} ${req.url}`);
  console.log('HEADERS:', req.headers);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');

  var data = '';

  req.on('data', function(chunk) {
    data += chunk
  });

  req.on('end', function() {
    console.log('BODY: ' + data);
    res.end(data + "\n");
  });
});

server.listen(port, hostname, function () {
  console.log(`Server running at http://localhost:${port}/`);
});
