'use strict';

//contrib
var Sequelize = require('sequelize');
var winston = require('winston');

//mine
var config = require('../config');
var logger = new winston.Logger(config.logger.winston);

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Profile', {
        sub: Sequelize.STRING, //auth service user id (record id - not username which may be not used)
        
        //public profile (settings that user don't mind publishing to public) stored as JSON
        public: {
            type: Sequelize.TEXT,
            defaultValue: '{}',
            get: function () { 
                var v = this.getDataValue('public');
                if(!v) return null;
                return JSON.parse(v);
            },
            set: function (value) {
                return this.setDataValue('public', JSON.stringify(value));
            }
        },

        //private profile
        private: {
            type: Sequelize.TEXT,
            defaultValue: '{}',
            get: function () { 
                var v = this.getDataValue('private');
                if(!v) return null;
                return JSON.parse(v);
            },
            set: function (value) {
                return this.setDataValue('private', JSON.stringify(value));
            }
        },
    });
}

