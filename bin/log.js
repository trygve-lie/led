/* jshint node: true, strict: true */

"use strict";

var config = require('./config.js'),
    bunyan = require('bunyan');



module.exports = bunyan.createLogger({
    name: config.get('name'), 
    streams: [
        {
            level: config.get('logConsoleLevel'),
            stream: process.stdout
        }
    ]
});
