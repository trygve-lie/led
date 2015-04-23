/* jshint node: true, strict: true */

"use strict";

var redis = require('redis'),
    mongo = require('livedb-mongo');



var DB = module.exports = function (redisHost, redisPort, mongoHost, mongoPort, logger) {
    this.cli = mongo('mongodb://' + mongoHost + ':' + mongoPort + '/test?auto_reconnect', {
        safe: true
    });
    this.pub = redis.createClient(redisPort, redisHost, {});
    this.sub = redis.createClient(redisPort, redisHost, {});
    this.log = logger.child({child:'db'});


    // General redis events 

    this.sub.on('ready', function () {
        this.log.info('redis is ready');
    }.bind(this));

    this.sub.on('connect', function () {
        this.log.info('connected to redis');
    }.bind(this));

    this.sub.on('error', function (err) {
        this.log.error('error communicating with redis');
        this.log.trace(err);
    }.bind(this));

    this.sub.on('end', function () {
        this.log.info('connection to redis ended');
    }.bind(this));

    // Pubsub

    this.sub.on('subscribe', function (channel, count) {
        this.log.info('subscribed to redis pubsub channel ' + channel, count);
    }.bind(this));

    this.sub.on('unsubscribe', function (channel, count) {
        this.log.info('unsubscribed from redis pubsub channel ' + channel, count);
    }.bind(this));


    // Handle errors on Pub channel
    // Do nothing, error handler on "sub" will be noicy enough

    this.pub.on('error', function (err) {});

};
