'use strict';

//contrib
var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');

//mine
var config = require('./config/config');
var db = require('./models');

//for retrieving public profile
//since it's *public* profile, no access control is performend on this
router.get('/public/:sub', /*jwt({secret: config.express.jwt.secret}),*/ function(req, res, next) {
    db.Profile.findOne({where: {sub: req.params.sub}}).then(function(profile) {
        if(profile) {
            res.json(profile.public);
        } else {
            //maybe user hasn't created his profile yet - it's ok to return empty in that case
            res.json({}); 
        }
    });
})

//for updating public profile
router.put('/public/:sub', jwt({secret: config.express.jwt.secret}), function(req, res, next) {

    //needs to have user scope
    if(req.user.scopes.common.indexOf("user") == -1) {
        return res.send(401, {message: "Unauthorized"});
    }
    //admin or the owner can edit it
    if(req.user.scopes.common.indexOf("admin") == -1) {
        if(req.params.sub  != req.user.sub) return res.send(401, {message: "Unauthorized"});
    }

    db.Profile.findOrCreate({where: {sub: req.params.sub}, default: {}}).spread(function(profile, created) {
        if(created) {
            console.log("Created new profile for user id:"+req.user.sub);
        }
        profile.public = req.body;

        profile.save().then(function() {
            res.json({message: "Public profile updated!"});
        });
    });
});

//retreieve private profile
router.get('/private/:sub', jwt({secret: config.express.jwt.secret}), function(req, res, next) {

    //needs to have user scope
    if(req.user.scopes.common.indexOf("user") == -1) {
        return res.send(401, {message: "Unauthorized"});
    }
    //admin or the owner can retrieve it
    if(req.user.scopes.common.indexOf("admin") == -1) {
        if(req.params.sub != req.user.sub) return res.send(401, {message: "Unauthorized"});
    }
    
    db.Profile.findOne({where: {sub: /*req.user.sub*/req.params.sub}}).then(function(profile) {
        if(profile) {
            res.json(profile.private);
        } else {
            //maybe user hasn't created his profile yet - it's ok to return empty in that case
            res.json({}); 
        }
    });
})

//for updating private profile
router.put('/public/:sub', jwt({secret: config.express.jwt.secret}), function(req, res, next) {

    //needs to have user scope
    if(req.user.scopes.common.indexOf("user") == -1) {
        return res.send(401, {message: "Unauthorized"});
    }
    //admin or the owner can edit it
    if(req.user.scopes.common.indexOf("admin") == -1) {
        if(req.params.sub != req.user.sub) return res.send(401, {message: "Unauthorized"});
    }

    db.Profile.findOrCreate({where: {sub: req.params.sub}, default: {}}).spread(function(profile, created) {
        if(created) {
            console.log("Created new profile for user id:"+req.user.sub);
        }
        profile.public = req.body;

        profile.save().then(function() {
            res.json({message: "Public profile updated!"});
        });
    });
});

//return id, sub, email of all users (used by user selector or such)
router.get('/users', jwt({secret: config.express.jwt.secret}), function(req, res) {
    db.Profile.findAll({
        //TODO what if local sub/email logins are disabled? I should return casid or such instead
        attributes: ['sub', 'public'],
    }).then(function(profiles) {
        res.json(profiles);
    });
});

module.exports = router;
