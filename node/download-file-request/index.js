var http = require('http');
var qs = require('querystring');

var body;
var mime = 'application/zip';
var port = 3000;

var server = http.createServer(function (req, res) {
    if (req.method !== 'POST') {
        res.writeHead(200);
        res.end('Only POST method supported so far!');
    };
    req.on('data', function (data) {
        body += data;

        if (body.length > 1e6)
            req.connection.destroy();
    });
    req.on('end', function () {
        var post = qs.parse(body);

        if (!post.file) {
            res.writeHead(200);
            res.end('No file provided!');
        }

        var content = 'data:' + mime + ';base64,' + post.file;

        res.writeHead(200, { 'Content-Type': mime });
        res.end(content, 'utf-8');
    });
});

server.listen(port, function () {
    console.log('File resender listening on port ' + port);
});
