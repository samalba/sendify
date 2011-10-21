var express = require('express'),
    form = require('connect-form'),
    redis = require('redis').createClient(),
    hashlib = require('hashlib'),
    tools = require('./tools');

var app = express.createServer(
        form({keepExtensions: true})
        );

app.listen(1042);

app.configure(function() {
    app.set('view engine', 'jade');
    app.use(express.static(__dirname + '/static'));
});

redis.on('error', function(err) {
    console.log(err.toString());
});

app.get('/', function(req, res) {
    var id = tools.randomId(6);
    var form_url = '/send/' + id;
    var link = 'http://' + req.header('Host') + '/fetch/' + id;
    res.render('index', {link: link, form_url: form_url});
});

app.post('/send/:id', function(req, res) {
    attr = req.params.id + '_attr';
    data = req.params.id + '_data';
    redis.del(data);
    req.form.handlePart = function(part) {
        redis.hset(attr, 'filename', part.filename);
        redis.hset(attr, 'mime', part.mime);
        part.on('data', function(chunk) {
            redis.rpush(data, chunk.toString('binary'));
        });
    };
    req.form.complete(function() {
        redis.rpush(data, '');
        var url = 'http://' + req.header('Host') + '/fetch/' + req.params.id;
        res.render('sent', {link: url});
    });
});

app.get('/fetch/:id', function(req, res) {
    attr = req.params.id + '_attr';
    data = req.params.id + '_data';
    redis.exists(attr, function(err, exists) {
        //if (!exists) {
        //    res.send('No data', 404);
        //    return;
        //}
        redis.hget(attr, 'mime', function(err, mime) {
            res.header('Content-Type', mime);
        });
        redis.hget(attr, 'filename', function(err, filename) {
            res.header('Content-Disposition', 'attachment; filename=' + filename);
        });
        var lpop_cb = function(err, chunk) {
            if (chunk === '') {
                res.end();
                redis.del(attr);
                redis.del(data);
                return;
            }
            if (chunk === null) {
                setTimeout(function() {
                    redis.lpop(data, lpop_cb);
                }, 1000);
                return;
            }
            res.write(chunk, 'binary');
            redis.lpop(data, lpop_cb);
        };
        redis.lpop(data, lpop_cb);
    });
});
