
//contrib
const express = require("express");
const router = express.Router();
const jwt = require("express-jwt");
const winston = require("winston");

const amqp = require("amqp");

//mine
const config = require("./config");
const db = require("./models");
const logger = winston.createLogger(config.logger.winston);

let amqp_conn;
function get_amqp_connection(cb) {
    if(amqp_conn) return cb(null, amqp_conn); //already connected
    amqp_conn = amqp.createConnection(config.event.amqp, {reconnectBackoffTime: 1000*10});
    amqp_conn.once("ready", ()=>{
        cb(null, amqp_conn);
    });
    amqp_conn.on("error", err=>{
        logger.error(err);
    });
}

let profile_ex;
get_amqp_connection((err, conn)=>{
    if(err) throw err;
    logger.debug("creating profile amqp exchange");
    conn.exchange("profile", {autoDelete: false, durable: true, type: 'topic', confirm: true}, (ex)=>{
        profile_ex = ex;
    });
});

/**
 * @apiGroup Profile
 * @api {get} /                 Query user public profiles
 * @apiParam {Object} where     Optional sequelize query to perform
 * @apiDescription              Returns all user profiles that matches query
 * 
 * @apiHeader {String}          Authorization A valid JWT token "Bearer: xxxxx"
 *
 * @apiSuccess {Object[]}       User profiles
 */
router.get("/", jwt({secret: config.express.jwt.pub}), function(req, res, next) {
    var query = {attributes: ["sub", "public"]}; //no private profile
    if(req.query.where) query.where = JSON.parse(req.query.where);
    if(req.query.order) query.order = req.query.order;
    if(req.query.limit) query.limit = req.query.limit;
    if(req.query.offset) query.offset = req.query.offset;
    db.Profile.findAll(query).then(function(profiles) {
        res.json({profiles, count: -1}); //count - TODO
    }).catch(next);
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
router.get("/public/:sub?", jwt({secret: config.express.jwt.pub, credentialsRequired: false}), function(req, res, next) {
    let maxage=300; //don't reload sooner than 5 minutes
    res.setHeader("Cache-Control", "public, max-age="+maxage);
    res.setHeader("Expires", new Date(Date.now() + maxage*1000).toUTCString());

    let sub = null;
    if(req.user) sub = req.user.sub;
    if(req.params.sub) sub = req.params.sub;
    if(!sub) return next("Please specify sub or pass your jwt");
    db.Profile.findOne({where: {sub: req.params.sub}}).then(function(profile) {
        logger.debug("settting max-age", maxage);
        if(profile) {
            res.json(profile.public);
        } else {
            //maybe user hasn't created his profile yet - it's ok to return empty in that case
            res.json({}); 
        }
    }).catch(next);
});

/**
 * @apiGroup Profile
 * @api {put} /public/:sub?     Put Public Profile
 * @apiDescription              Update user's public profile. :sub will be default to user's sub from jwt
 * 
 * @apiHeader {String}          Authorization A valid JWT token "Bearer: xxxxx"
 *
 */
router.put("/public/:sub?", jwt({secret: config.express.jwt.pub}), function(req, res, next) {
    var sub = req.user.sub;
    if(req.params.sub) sub = req.params.sub;
    if(!req.user.scopes.sca || !~req.user.scopes.sca.indexOf("admin")) {
        //non admin can only update user's own profile
        if(sub != req.user.sub) return res.send(401, {message: "Unauthorized"});
    }

    db.Profile.findOrCreate({where: {sub}, default: {}}).spread(function(profile, created) {
        if(created) {
            logger.debug("Created new profile for user id:"+req.user.sub);
        }
        //roundabout way of updating profile.public
        var obj = {};
        for(let key in profile.public) {
            obj[key] = profile.public[key];
        }
        for(let key in req.body) obj[key] = req.body[key];
        profile.public = obj;
        profile.save().then(function() {
            res.json({message: "Public profile updated!"});
        });
        profile_ex.publish(sub+".public", obj);
    }).catch(next);
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
router.get("/private/:sub?", jwt({secret: config.express.jwt.pub}), function(req, res, next) {
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
});

/**
 * @apiGroup Profile
 * @api {put} /private/:sub?    Set Private Profile
 * @apiDescription              Update user's private profile. Admin can set :sub parameter to update other
 *                              user's private profile
 * 
 * @apiHeader {String}          Authorization A valid JWT token "Bearer: xxxxx"
 *
 */
router.put("/private/:sub?", jwt({secret: config.express.jwt.pub}), function(req, res, next) {
    var sub = req.user.sub;
    if(req.params.sub) sub = req.params.sub;
    if(!req.user.scopes.sca || !~req.user.scopes.sca.indexOf("admin")) {
        //non admin can only update user's own profile
        if(sub  != req.user.sub) return res.send(401, {message: "Unauthorized"});
    }

    //logger.debug(req.body);

    db.Profile.findOrCreate({where: {sub: sub}, default: {}}).spread(function(profile, created) {
        if(created) {
            logger.debug("Created new profile for user id:"+req.user.sub);
        }

        //roundabout way of updating profile.private
        var obj = {};
        for(let key in profile.private) {
            obj[key] = profile.private[key];
        }
        for(let key in req.body) obj[key] = req.body[key];
        profile.private = obj;
        profile.save().then(function(saved) {
            res.json({message: "Private profile updated!" /*, profile: saved*/});
        });
        profile_ex.publish(sub+".private", obj);
    });
});

//DEPRECATED - use GET / query
//return id, sub, and public profile of all users (used by user selector or such)
//TODO - let user client choose which attributes to load instead?
router.get("/users", jwt({secret: config.express.jwt.pub}), function(req, res) {
    db.Profile.findAll({
        //TODO what if local sub/email logins are disabled? I should return casid or such instead
        attributes: ["sub", "public"],
    }).then(function(profiles) {
        //console.log(JSON.stringify(profiles, null, 4));
        res.json(profiles);
    });
});

module.exports = router;
