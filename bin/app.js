/* jshint node: true, strict: true */

"use strict";

var path        = require('path'),
    http        = require('http'),
    express     = require('express'),
    serveStatic = require('serve-static'),

    DB          = require('./db.js'),
    log         = require('./log.js'),
    config      = require('./config.js'),


    WebSocket   = require('ws').Server,

    livedb      = require('livedb'),
    sharejs     = require('share'),

    richText    = require('rich-text'),
    Delta       = require('rich-text/lib/delta'),

    Duplex      = require('stream').Duplex,

    app         = express();



var db = new DB(config.get('redisHost'), config.get('redisPort'), config.get('mongoHost'), config.get('mongoPort'), log);


// Set up livedb and sharejs

var driver  = livedb.redisDriver(db.cli, db.pub, db.sub);
var backend = livedb.client({snapshotDb: db.cli, driver: driver});
var share   = sharejs.server.createClient({backend: backend});


// Register OT types

livedb.ot.registerType(richText.type);
/*
setTimeout(function() {
    backend.fetch('docs', 'hello2', function (err, snapshot) {
        var delta = new Delta();
        console.log(JSON.stringify(snapshot, null, 2));
    });
}, 1000);
*/


// Set up http routes

app.use('/', serveStatic(path.resolve(__dirname, '../' + config.get('docRoot'))));
app.use(serveStatic(sharejs.scriptsDir));
console.log(sharejs.scriptsDir);





// Send cursor info via Primus/SockJS

var httpServer = http.createServer(app);
/*
var Primus = require('primus');
var cursorWsServer = new Primus(httpServer, {transformer: 'SockJS'});
cursorWsServer.on('connection', function (spark) {
    spark.on('data', function (data) {
        cursorWsServer.write(data);
    });
});
*/



var editWss = new WebSocket({server: httpServer, path: '/edit'});

editWss.on('connection', function (client) {
    var stream = new Duplex({objectMode: true});
    stream._write = function (chunk, encoding, callback) {
        if (client.state !== 'closed') {
            client.send(JSON.stringify(chunk));
        }
        callback();
    };

    stream._read = function () {};

    stream.headers = client.upgradeReq.headers;
    stream.remoteAddress = client.upgradeReq.connection.remoteAddress;

    client.on('message', function (data) {
        log.debug(data);
        stream.push(JSON.parse(data));
    });

    client.on('close', function (reason) {
        stream.emit('close');
        stream.emit('end');
        stream.end();
    });

    stream.on('error', function (msg) {
        client.close();
    });

    stream.on('end', function (msg) {
        client.close();
    });

    share.listen(stream);
});


module.exports = httpServer;
