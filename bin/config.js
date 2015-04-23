/* jshint node: true, strict: true */

"use strict";

var fs      = require('fs'),
    convict = require('convict'),
    pckage  = require('../package.json');



// Configuration schema

var conf = module.exports = convict({
env: {

    doc: "Applicaton environments",
        format  : ["development", "production"],
        default : "development",
        env     : "NODE_ENV",
        arg     : "env"
    },
    
    name: {
        doc     : "Name of the application",
        format  : String,
        default : pckage.name
    },

    version: {
        doc     : "Version of the application",
        format  : "*",
        default : pckage.version
    },

    httpServerPort: {
        doc     : "The port the server should bind to",
        format  : "port",
        default : 9000,
        arg     : "http-port"
    },

    docRoot: {
        doc     : "Document root for static files to be served by the http server",
        format  : String,
        default : "./public"
    },

    logConsoleLevel: {
        doc     : "Which level the console transport log should log at",
        format  : String,
        default : "debug"
    },

    redisHost: {
        doc     : "Host name to Redis server",
        format  : String,
        default : 'localhost',
        arg     : "redis-host"
    },

    redisPort: {
        doc     : "Port number to Redis server",
        format  : "port",
        default : 6379,
        arg     : "redis-port"
    },

    mongoHost: {
        doc     : "Host name to MongoDB server",
        format  : String,
        default : 'localhost',
        arg     : "mongo-host"
    },

    mongoPort: {
        doc     : "Port number to MongoDB server",
        format  : "port",
        default : 27017,
        arg     : "mongo-port"
    }

});



// Load and validate configuration depending on environment

var env = conf.get('env');

if (fs.existsSync('./config/local.json')) {
    conf.loadFile(['./config/' + env + '.json', './config/local.json']);
} else {
    conf.loadFile(['./config/' + env + '.json']);
}

conf.validate();
