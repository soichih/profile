
const Sequelize = require('sequelize');
const winston = require('winston');

const config = require('../config');
const logger = winston.createLogger(config.logger.winston);

//for field types
//http://docs.sequelizejs.com/en/latest/api/datatypes/

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Migration', {
        version: Sequelize.INTEGER
    });
}

