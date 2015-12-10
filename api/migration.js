
//contrib
var winston = require('winston');
var async = require('async');
var Promise = require('promise');
var Sequelize = require('sequelize');

//mine
var config = require('./config');
var logger = new winston.Logger(config.logger.winston);
var db = require('./models');

var migrations = [
    /*
    function(qi, next) {
        logger.info("renaming host.host to host.info");
        qi.renameColumn('Hosts', 'host', 'info').then(function() { next(); });
    },
    */
];

exports.run = function() {
    logger.debug("running migration");
    return new Promise(function(resolve, reject) {
        db.Migration.findOne({}).then(function(info) {
            //logger.debug(info);
            if(!info) {
                //assume brand new - skip everything
                return db.Migration.create({version: migrations.length}).then(resolve);
            } else {
                var count = migrations.length;
                var ms = migrations.splice(info.version);
                qi = db.sequelize.getQueryInterface();
                async.eachSeries(ms, function(m, next) {
                    m(qi, next);
                }, function(err) {
                    if(err) reject(err);
                    else {
                        info.version = count;
                        info.save().then(function() {
                            resolve("migration complete");
                        });
                    }
                });
            }
        });
    });
}

