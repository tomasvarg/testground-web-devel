var app = require('koa')();
var mount = require('koa-mount');
var serve = require('koa-static');
var sendfile = require('koa-sendfile');
var parse = require('co-busboy');
var fs = require('fs');

var ROOT_DIR = __dirname + '/';
var FILES_DIR = ROOT_DIR + 'files/';

app.use(function *showRequest(next) {
    console.log('path:', this.path, 'method:', this.method, '-----------------------');
    console.log('querystring:', this.request.querystring, 'query:', this.request.query);
    console.log('urlencoded:', this.request.is('urlencoded'), 'multipart:', this.request.is('multipart'));
    console.log('request:', this.request);
    yield next;
});

app.use(serve(__dirname + '/public'));

app.use(function *getMultipartRequest(next) {
    if (!this.request.is('multipart'))
        return yield next;

    var files = [];
    var parts = parse(this);
    var part;

    while (part = yield parts) {
        if (!part.pipe) {
            console.log('fields:', part);
            continue;
        }

        /*
        yield saveFile(part, FILES_DIR).then(function (resp) {
            files.push(resp);
        }, function (error) {
            files.push(error);
        });
        */
        files.push(yield saveFile(part, FILES_DIR));
    }

    this.body = files;
});

app.use(mount('/download', function *sendFileHandler(next) {
    yield next;

    var fname = this.request.query.file || 'archive.zip';

    if (!(yield fileExists(FILES_DIR + fname)))
        return this.body = { message: 'File not found.', file: fname };

    var stats = yield sendfile(this, FILES_DIR + fname);
    //console.log('sendfile response:', this.response);

    if (!this.status)
        this.throw(404);
}));

function saveFile(stream, destDir) {
    //return new Promise(function(resolve, reject) {
    return function(done) {
        var writer = fs.createWriteStream(destDir + stream.filename);
        var resp = { file: stream.filename };

        stream.on('error', finish);
        writer.on('error', finish);

        writer.on('close', function () {
            finish(null, { bytesWritten: writer.bytesWritten });
        });

        stream.pipe(writer);

        function finish(error, args) {
            resp.message = error ? 'saving ' + resp.file + ' failed:' + error
                    : 'saved ' + resp.file + ' (' + args.bytesWritten + ' bytes)';
            //error ? reject(resp) : resolve(resp);
            done(null, resp);
        }
    //});
    }
}

function fileExists(path) {
    return function(done) {
        fs.stat(path, function (err, res) {
            done(null, !err);
        });
    }
}

app.listen(3000);

console.log('listening on port 3000');
