'use strict';

//node
var fs        = require('fs');
var path      = require('path');

//contrib
var Sequelize = require('sequelize');
var basename  = path.basename(module.filename);

//mine
var config    = require('../config');

if(typeof config.db === 'string') {
    var sequelize = new Sequelize(config.db, {
        /*
        logging: function(str) {
            //ignore for now..
        }
        */
        logging: false
    });
} else {
    //assume object
    var sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, config.db);
}

var db        = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename);
  })
  .forEach(function(file) {
    if (file.slice(-3) !== '.js') return;
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
