
//contrib
var request = require('supertest')
var assert = require('assert');

//mine
var config = require('../api/config');

//use temporary db for test..
config.db.storage = "/tmp/test.sqlite";

var db = require('../api/models');
var app = require('../api/server').app;

before(function(done) {
    console.log("synching sequelize");
    this.timeout(10000);
    db.sequelize.sync({force: true}).then(function() {
        console.log("synchronized");
        done();
    });
});


describe('GET /health', function() {
    it('return 200', function(done) {
        request(app)
        .get('/health')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/) 
        .expect(200, done);
    });
});

before(function(done) {
    var user = db.Profile.build({
        sub: '1',
        public: {
            what: "ever"
        },
        private: {
            what: "ever2"
        },
    });
    user.save().then(function(_user) {
        //console.dir(_user);
        done();
    });
});

/*
describe('GET /config', function() {
    it('return 200', function(done) {
        request(app)
        .get('/config')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/) 
        .end(done)
    });
});
*/

describe('public', function() {
    it('#/public/1', function(done) {
        request(app)
        .get('/public/1')
        .set('Accept', 'application/json')
        .end(function(err, res) {
            if(err) return done(err);
            assert.deepEqual(res.body, {what: "ever"});
            console.dir(res.body);
            done();
        })
    });
});

describe('public', function() {
    it('#/private/1', function(done) {
        request(app)
        .get('/private/1')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '+config.express.jwt.test)
        .end(function(err, res) {
            if(err) return done(err);
            assert.deepEqual(res.body, {what: "ever2"});
            console.dir(res.body);
            done();
        })
    });
});

