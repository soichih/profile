
var fs = require('fs');
var winston = require('winston');

exports.profile = {
    //page for main login form
    login_url: 'https://soichi7.ppa.iu.edu/auth',
}

exports.db = {
    dialect: 'sqlite',
    storage: '/usr/local/sqlite/profile.sqlite'
}

exports.express = {
    //web server port
    port: 12402,

    jwt: {
        //secret: fs.readFileSync('./config/auth.pub'),
        pub: fs.readFileSync('/home/hayashis/git/auth/api/config/auth.pub'),
    }
};

/*
exports.logger = {
    express: require('morgan')('combined'),
    api: 'log/api.log',
    exception: 'log/exception.log',
    //express_error_handler: {dumpExceptions: true, showStack: true},
}
*/

exports.logger = {
    winston: {
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
            
            /*
            //store all warnings / errors in error.log
            new (winston.transports.File)({ 
                filename: 'error.log',
                level: 'warn'
            })
            */
        ]
    },
    
    /*
    //logfile to store all requests (and its results) in json
    request: {
        transports: [
            new (winston.transports.File)({ 
                filename: 'request.log',
                json: true
            })
            new (winston.transports.Logstash)({
                port: 28777,
                node_name: 'isdp-soichi-dev',
                host: 'soichi7.ppa.iu.edu'
            })
        ]
    }
    */
}


