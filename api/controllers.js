'use strict';

//contrib
var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');

//mine
var config = require('./config');
var db = require('./models');

/**
 * @api {get} /                 Query user public profiles
 * @apiParam {Object} find      Optional Mongo query to perform
 * @apiDescription              Returns all user profiles that matches query
 * @apiGroup Profile
 * 
 * @apiHeader {String}          Authorization A valid JWT token "Bearer: xxxxx"
 *
 * @apiSuccess {Object[]}       User profiles
 */
router.get('/', jwt({secret: config.express.jwt.pub}), function(req, res, next) {
    var find = {};
    if(req.query.find || req.query.where) find = JSON.parse(req.query.find || req.query.where);
    //TODO - only allow querying public profile
    var query = db.Profiles.find(find);
    if(req.query.sort) query.sort(req.query.sort);
    if(req.query.limit) query.limit(req.query.limit);
    query.exec(function(err, profiles) {
        if(err) return next(err);
        profiles.forEach(function(profile) {
            delete profiles.private;
        });
        res.json(profiles);
    });
});

/**
 * @apiGroup Profile
 * @api {get} /public/:sub?     Get Public Profile
 * @apiDescription              Get user's public profile. Optional :sub will be default to user's sub from jwt
 *                              Set to any other user's sub to query other user's public profile
 * 
 * @apiHeader {String}          Authorization A valid JWT token "Bearer: xxxxx" (optional)
 *
 */
router.get('/public/:sub?', jwt({secret: config.express.jwt.pub, credentialsRequired: false}), function(req, res, next) {
    var sub = null;
    if(req.user) sub = req.user.sub;
    if(req.params.sub) sub = req.params.sub;
    if(!sub) return next("Please specify sub or pass your jwt");
    db.Profile.findOne({where: {sub: req.params.sub}}).then(function(profile) {
        if(profile) {
            res.json(profile.public);
        } else {
            //maybe user hasn't created his profile yet - it's ok to return empty in that case
            res.json({}); 
        }
    });
})

/**
 * @apiGroup Profile
 * @api {put} /public/:sub?     Put Public Profile
 * @apiDescription              Update user's public profile. :sub will be default to user's sub from jwt
 * 
 * @apiHeader {String}          Authorization A valid JWT token "Bearer: xxxxx"
 *
 */
router.put('/public/:sub?', jwt({secret: config.express.jwt.pub}), function(req, res, next) {
    var sub = req.user.sub;
    if(req.params.sub) sub = req.params.sub;
    if(!req.user.scopes.sca || !~req.user.scopes.sca.indexOf("admin")) {
        //non admin can only update user's own profile
        if(sub != req.user.sub) return res.send(401, {message: "Unauthorized"});
    }

    db.Profile.findOrCreate({where: {sub: sub}, default: {}}).spread(function(profile, created) {
        if(created) {
            console.log("Created new profile for user id:"+req.user.sub);
        }
        //roundabout way of updating profile.public
        var obj = {};
        for(var key in profile.public) {
            obj[key] = profile.public[key];
        }
        for(var key in req.body) obj[key] = req.body[key];
        profile.public = obj;

        profile.save().then(function() {
            res.json({message: "Public profile updated!"});
        });
    });
});


/**
 * @apiGroup Profile
 * @api {get} /private/:sub?    Get Private Profile
 * @apiDescription              Get user's private profile. Admin can specify optional :sub to retrieve 
 *                              other user's provate profile
 * 
 * @apiHeader {String}          Authorization A valid JWT token "Bearer: xxxxx"
 *
 */
router.get('/private/:sub?', jwt({secret: config.express.jwt.pub}), function(req, res, next) {
    var sub = req.user.sub;
    if(req.params.sub) sub = req.params.sub;
    if(!req.user.scopes.sca || !~req.user.scopes.sca.indexOf("admin")) {
        //non admin can only update user's own profile
        if(sub != req.user.sub) return res.send(401, {message: "Unauthorized"});
    }
    
    db.Profile.findOne({where: {sub: sub}}).then(function(profile) {
        if(profile) {
            res.json(profile.private);
        } else {
            //maybe user hasn't created his profile yet - it's ok to return empty in that case
            res.json({}); 
        }
    });
})

/**
 * @apiGroup Profile
 * @api {put} /private/:sub?    Set Private Profile
 * @apiDescription              Update user's private profile. Admin can set :sub parameter to update other
 *                              user's private profile
 * 
 * @apiHeader {String}          Authorization A valid JWT token "Bearer: xxxxx"
 *
 */
router.put('/private/:sub?', jwt({secret: config.express.jwt.pub}), function(req, res, next) {
    var sub = req.user.sub;
    if(req.params.sub) sub = req.params.sub;
    if(!req.user.scopes.sca || !~req.user.scopes.sca.indexOf("admin")) {
        //non admin can only update user's own profile
        if(sub  != req.user.sub) return res.send(401, {message: "Unauthorized"});
    }

    db.Profile.findOrCreate({where: {sub: sub}, default: {}}).spread(function(profile, created) {
        if(created) {
            console.log("Created new profile for user id:"+req.user.sub);
        }

        //roundabout way of updating profile.private
        var obj = {};
        for(var key in profile.private) {
            obj[key] = profile.private[key];
        }
        for(var key in req.body) obj[key] = req.body[key];
        profile.private = obj;

        profile.save().then(function() {
            res.json({message: "Public profile updated!"});
        });
    });
});

//DEPRECATED - use GET / query
//return id, sub, and public profile of all users (used by user selector or such)
//TODO - let user client choose which attributes to load instead?
router.get('/users', jwt({secret: config.express.jwt.pub}), function(req, res) {
    db.Profile.findAll({
        //TODO what if local sub/email logins are disabled? I should return casid or such instead
        attributes: ['sub', 'public'],
    }).then(function(profiles) {
        //console.log(JSON.stringify(profiles, null, 4));
        res.json(profiles);
    });
});


module.exports = router;
