
var fs = require('fs');
var winston = require('winston');

exports.profile = {
    //page for main login form
    login_url: 'https://somewhere/auth',
}

exports.db = {
    dialect: 'sqlite',
    storage: '/db/profile.sqlite',
    logging: false,
}

exports.express = {
    //web server port
    host: "0.0.0.0",
    port: 8080,

    jwt: {
        pub: fs.readFileSync(__dirname+'/auth.pub'),
    }
};

exports.logger = {
    winston: {
        requestWhitelist: ['url', /*'headers',*/ 'method', 'httpVersion', 'originalUrl', 'query'],
        transports: [
            //display all logs to console
            new winston.transports.Console({
                timestamp: function() {
                    var d = new Date();
                    return d.toString(); //show timestamp
                },
                level: 'debug',
                colorize: true
            }),
        ]
    }
}


