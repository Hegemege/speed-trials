
var express = require("express");
var bodyParser = require("body-parser");
var fs = require("fs");
var path = require("path");
var uuidv4 = require("uuid/v4");
var cors = require("cors")
var bluebird = require("bluebird");

// Auth
var session = require("express-session");
var passport = require("passport");
var OAuth2Strategy = require("passport-oauth").OAuth2Strategy;
var request = require("request");

// DB
var Datastore = require("nedb");
var dbDefaults = require("./dbDefaults");

var NedbStore = require("nedb-session-store")( session );

// Config
var config = require("../config/config");

// Input validation
var expressValidator = require("express-validator");

// App routes
var matchRoutes = require("./matchRoutes");
var userRoutes = require("./userRoutes");

var utils = require("./utils");

// Object definitions
var Models = require("./models");

// Constants
MATCH_CODE_LENGTH = 7;

// App
module.exports = function() {
    const app = express();

    // Serve static files out of public/ if in dev
    if (config.ENV === "dev") {
        app.use(express.static(path.join(__dirname, "public")));
    }

    // Consider disabling cors out-of-dev
    app.use(cors({ credentials: true, origin: true }));
    app.use(bodyParser.json());

    app.use(expressValidator());

    // Session object that will be shared between express and passport
    var sessionObject = session(
        {
            secret: config[config.ENV].sessionSecret, 
            resave: false, 
            saveUninitialized: false,
            secure: false,
            
            store: new NedbStore({
                filename: path.join(__dirname, "/db/sessionstore.db"),
                autoCompactInterval: 60 * 60 * 1000 // Every hour
            }),
        });

    app.use(sessionObject);

    app.use(passport.initialize());
    app.use(passport.session());

    // Auth
    // Override passport profile function to get user profile from Twitch API
    OAuth2Strategy.prototype.userProfile = function(accessToken, done) {
        var options = {
            url: "https://api.twitch.tv/kraken/user",
            method: "GET",
            headers: {
                "Client-ID": config[config.ENV].twitchClientId,
                "Accept": "application/vnd.twitchtv.v5+json",
                "Authorization": "OAuth " + accessToken
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
    
    passport.use("twitch", new OAuth2Strategy({
        authorizationURL: "https://api.twitch.tv/kraken/oauth2/authorize",
        tokenURL: "https://api.twitch.tv/kraken/oauth2/token",
        clientID: config[config.ENV].twitchClientId,
        clientSecret: config[config.ENV].twitchClientSecret,
        callbackURL: config[config.ENV].twitchClientCallbackUri,
        state: true,
        // WHY THE FUCK DOES passport-oauth USE THE HOSTNAME AS KEY
        // WHEN IT'S PRETTY MUCH ALWAYS STORED INTO SESSION STORAGE
        // WHICH CAN BE MONGODB-STYLE AND NOT SUPPORTING DOTS IN
        // THE SESSION KEY
        sessionKey: "oauth2_twitch" 
    },
    function(accessToken, refreshToken, profile, done) {
        profile.accessToken = accessToken;
        profile.refreshToken = refreshToken;

        done(null, profile);
    }));


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

    // Set route to start OAuth link, this is where you define scopes to request
    app.get("/auth/twitch", passport.authenticate("twitch", { scope: config[config.ENV].twitchScope }));

    // Set route for OAuth redirect
    app.get("/auth/twitch/callback", passport.authenticate("twitch", { successRedirect: "/", failureRedirect: "/" }));


    // All DB stores
    // Save the DB stores to the express app.locals
    app.locals.mapPools = new Datastore({ 
        filename: path.join(__dirname, "/db/mappools.db"), 
        autoload: true 
    });
    app.locals.matches = new Datastore({ 
        filename: path.join(__dirname, "/db/matches.db"), 
        autoload: true, 
        timestampData: true
    });


    // Check for DB initialization with default values
    // If DB contains no records, initialize with dbDefaults.mapPools
    app.locals.mapPools.find({ }, (err, docs) => {
        if (err) {
            console.log("Could not test mappools.db for initialized values: " + err);
            return;
        }

        if (docs.length === 0) {
            app.locals.mapPools.insert(dbDefaults.mapPools, (err, docs) => {
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


    // Set up automatic empty match cleanup rules
    // Remove non-started matches after 1 week of inactivity
    // Check every hour
    let inactivityCheckInterval = 60 * 60 * 1000; // 1 hour
    let inactivityRemoveInterval = 7 * 24 * 60 * 60 * 1000; // 7 days
    if (config.ENV === "dev") {
        inactivityCheckInterval = 60 * 1000; // 1 minute
        inactivityRemoveInterval = 10 * 60 * 1000; // 10 minutes
    }
    setInterval(() => {
        let weekAgoMS = Date.now() - inactivityRemoveInterval;
        let weekago = new Date(weekAgoMS);

        app.locals.matches.remove(
            { 
                "updatedAt": { 
                    $lt: weekago 
                }, "started": false
            }, { multi: true }, function(err, docs) {
            if (docs > 0) {
                console.log("Removed " + docs + " empty old matches");
            }
        });
    }, inactivityCheckInterval);

    // API routes

    // Main api page, acts as a ping endpoint
    app.get("/api", function(req, res) {
        res.status(200).send({ message: "success" });
    });

    app.use("/api/match", require("./matchRoutes"));
    app.use("/api/user", require("./userRoutes"));

    // Returns to server.js, which starts the server (and passes params to socket.io)
    return {app: app, params: { sessionObject: sessionObject }};
};

