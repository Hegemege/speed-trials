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

var NedbStore = require('nedb-session-store')( session );

// Config
var config = require("../config/config");

// Input validation
var validator = require("express-validator");

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
    // Serve static files out of public/
    app.use(express.static(path.join(__dirname, "public")));
    app.use(cors({ credentials: true, origin: true }));
    app.use(bodyParser.json());
    app.use(validator());
    app.use(session(
        {
            secret: config[config.ENV].sessionSecret, 
            resave: false, 
            saveUninitialized: false,
            secure: false,
            /*
            // Enable session store to DB if needed.
            // Requires some fixing, as only the username needs to be stored from passport
            store: new NedbStore({
                filename: path.join(__dirname, "/db/sessionstore.db")
            })
            */
        })
    );

    app.use(passport.initialize());
    app.use(passport.session());

    // Simulate latency
    if (config.ENV === "dev") {
        console.log("Simulating latency in dev");
        app.use(function(req,res,next){
            let latencyMin = config[config.ENV]["simulateLatencyMin"];
            let latencyMax = config[config.ENV]["simulateLatencyMax"];
            let latency = Math.random() * (latencyMax - latencyMin) + latencyMin;
            setTimeout(next, latency);
        });
    }
    

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
        res.status(200).send({ result: true, code: "1234" });
    });

    app.get("/api/user", function(req, res) {
        if (req.session.passport && req.session.passport.user) {
            if (req.session.passport.user.speed_trials_guest_name) {
                res.status(200).send({ name: req.session.passport.user.speed_trials_guest_name, isTwitchAuthenticated: false });
            } else {
                res.status(200).send({ name: req.session.passport.user.name, isTwitchAuthenticated: true });
            }
        } else {
            res.status(200).send({ name: "", isTwitchAuthenticated: false });
        }        
    });

    app.post("/api/user", function(req, res) {
        if (req.body["guestName"] === "") {
            // User wants to reset their user credentials
            // Set session.passport to null
            req.session.passport = null;
            res.status(200).send({ message: "success" });
            return;
        }

        req.checkBody("guestName", "Guest name can contain a-z, A-Z, 0-9 or an underscore, and must be 4 to 25 symbols.").matches("^[a-zA-Z0-9_]{4,25}$");

        var errors = req.validationErrors();
        if (errors) {
            res.status(200).send(errors);
            return;
        } else {
            // Empty the passport.user and assign .speed_trials_guest_name
            req.session.passport = {
                user: {
                    speed_trials_guest_name: req.body["guestName"]
                }
            }

            res.status(200).send({ message: "success" });
        }
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
