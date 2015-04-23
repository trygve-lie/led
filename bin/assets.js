/* jshint node: true, strict: true */

"use strict";

var browserify  = require('browserify'),
    path        = require('path'),
    log         = require('./log.js');



// Convert and serve commonJS modules as a js bundle

module.exports.js = function(req, res){
    res.writeHead(200, {'Content-Type' : 'application/javascript'});
    browserify(path.resolve(__dirname, '../src/js/main.js'), {debug : true})
        .bundle()
        .pipe(res);
};
