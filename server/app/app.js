var express = require("express");
var bodyParser = require("body-parser");
var fs = require("fs");
var path = require("path");
var uuidv4 = require('uuid/v4');
var cors = require('cors')

// Auth
var session = require('express-session');
var passport = require('passport');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var request = require('request');

// DB
var Datastore = require("nedb");
var dbDefaults = require("./dbDefaults");

// Config
var config = require("../config/config");

var cookieParser = require("cookie-parser");
var cookieSession = require("cookie-session");

// Object definitions
class Trial {
    constructor(name, joinCode, host) {
        this.name = name;
        this.joinCode = joinCode;
        this.host = host;
        this.players = [host];
        this.mapPool = [];
    }
}

// App
module.exports = function() {
    const app = express();
    //app.use(bodyParser.json());
    app.use(session({secret: config[config.ENV].sessionSecret, resave: false, saveUninitialized: false}));
    
    // Serve static files out of public/
    app.use(express.static(path.join(__dirname, "public")));

    app.use(passport.initialize());
    app.use(passport.session());
    //app.use(cors({ credentials: true, origin: true }));

    

    // Auth
    // Override passport profile function to get user profile from Twitch API
    OAuth2Strategy.prototype.userProfile = function(accessToken, done) {
        var options = {
            url: 'https://api.twitch.tv/kraken/user',
            method: 'GET',
            headers: {
                'Client-ID': config[config.ENV].twitchClientId,
                'Accept': 'application/vnd.twitchtv.v5+json',
                'Authorization': 'OAuth ' + accessToken
            }
        };
      
        request(options, function (error, response, body) {
            if (response && response.statusCode == 200) {
                done(null, JSON.parse(body));
            } else {
                done(JSON.parse(body));
            }
        });
    }

    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });
    
    passport.use('twitch', new OAuth2Strategy({
        authorizationURL: 'https://api.twitch.tv/kraken/oauth2/authorize',
        tokenURL: 'https://api.twitch.tv/kraken/oauth2/token',
        clientID: config[config.ENV].twitchClientId,
        clientSecret: config[config.ENV].twitchClientSecret,
        callbackURL: config[config.ENV].twitchClientCallbackUri,
        state: true
    },
    function(accessToken, refreshToken, profile, done) {
        profile.accessToken = accessToken;
        profile.refreshToken = refreshToken;
    
        // Securely store user profile in your DB
        //User.findOrCreate(..., function(err, user) {
        //  done(err, user);
        //});
        console.log(profile);
    
        done(null, profile);
    }
    ));
    
    // Set route to start OAuth link, this is where you define scopes to request
    app.get('/auth/twitch', passport.authenticate('twitch', { scope: config[config.ENV].twitchScope }));

    // Set route for OAuth redirect
    app.get('/auth/twitch/callback', passport.authenticate('twitch', { successRedirect: '/', failureRedirect: '/' }));


    // All DB stores
    const mapPools = new Datastore({ filename: path.join(__dirname, "/db/mappools.db"), autoload: true });
    const trials = new Datastore({ filename: path.join(__dirname, "/db/mappools.db"), autoload: true})

    // Check for DB initialization with default values
    // If DB contains no records, initialize with dbDefaults.mapPools
    mapPools.find({ }, (err, docs) => {
        if (err) {
            console.log("Could not test mappools.db for initialized values: " + err);
            return;
        }

        if (docs.length === 0) {
            mapPools.insert(dbDefaults.mapPools, (err, docs) => {
                if (err) {
                    console.log("Could not insert default mapPools into mappools.db: " + err);
                    return;
                }

                console.log("mappools.db successfully initialized with default values.")
            });
            return;
        }

        console.log("Skipping mappools.db initialization.");
    });

    // API routes

    // Main api page, acts as a ping endpoint
    app.get("/api", function(req, res) {
        res.setHeader("Content-Type", "application/json");
        res.status(200).send({ message: "success" });
    });

    // API routes that touch the DB
    app.post("/api/create-match", function(req, res) {
        res.status(200).send({ message: "success" });
    });

    return app;
};

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

/*
 * Validates a given field of the request body.
 * The body must contain the field, and if numeric = True,
 * the field string must resolve to a valid number.
 */
function validate(req, res, field, numeric) {
    if (req.body[field] === undefined) {
        res.status(400).send({ error: field + " not found in request body" });
        return false;
    }

    if (numeric && !isNumeric(req.body[field])) {
        res.status(400).send({ error: field + " is not numeric" });
        return false;
    }

    return true;
}
