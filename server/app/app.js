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

// Socket IO shared session with express
var sharedsession = require("express-socket.io-session");

// DB
var Datastore = require("nedb");
var dbDefaults = require("./dbDefaults");

var NedbStore = require("nedb-session-store")( session );

// Config
var config = require("../config/config");

// Input validation
var expressValidator = require("express-validator");
var validator = require("validator");

// Object definitions
class Match {
    constructor(name, code, host) {
        this.name = name;
        this.code = code;
        this.host = host; // Host user
        this.users = []; // List of all users
        this.mapPool = []; // Chosen mappool
        this.started = false;
        this.ended = false;
    }
}

class User {
    constructor(name, guest, id) {
        this.name = name; // Current username
        this.guest = guest;

        // Twitch ID. null if guest
        // In dev mode, sessionID will be used
        // Does not expose the field if the class is used for cleaned data without IDs
        if (id !== undefined) { 
            this.id = id; 
        }
    }
}

class MatchSocket {
    constructor(matchId) {
        this.matchId = matchId
        this.connectedSockets = [];
    }
}

// Constants
MATCH_CODE_LENGTH = 7;

// App
module.exports = function() {
    const app = express();

    // Serve static files out of public/
    app.use(express.static(path.join(__dirname, "public")));
    app.use(cors({ credentials: true, origin: true }));
    app.use(bodyParser.json());

    app.use(expressValidator());

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
    const mapPools = new Datastore({ 
        filename: path.join(__dirname, "/db/mappools.db"), 
        autoload: true 
    });
    const matches = new Datastore({ 
        filename: path.join(__dirname, "/db/matches.db"), 
        autoload: true, 
        timestampData: true
    });


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

        matches.remove(
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

    // API routes that touch the DB
    app.post("/api/create-match", function(req, res) {
        let user = validateUser(req.session);
        if (!user.valid) {
            res.status(403).send({ error: "User is not logged in." });
            return;
        }

        // Users can create matches in dev mode
        if (user.guest && config.ENV !== "dev") {
            res.status(403).send({ 
                error: "Guests can not create matches. Please log out from the navigation bar, and log back in via Twitch." 
            });
            return;
        }

        let userObject = getUserObject(req.session, req.sessionID);

        let code = getNewMatchCode();
        let match = new Match("Match " + code, code, userObject);

        // First test if code is already in use.
        // 1 in 64^7 chance, we need to celebrate it!
        matches.find({ code: code }, (err, docs) => {
            if (err) {
                console.log("Error while finding match by code " + code + ": " + err);
                res.status(500).send({ error: "Internal server error."});
                return;
            }
            if (docs.length !== 0) {
                res.status(400).send({ error: "Jackpot! Room already exists. That's a 1 in 64^7 chance!" });
                return;
            }
        });

        matches.insert(match, (err, docs) => {
            if (err) {
                console.log("Error while inserting match: " + match + ": " + err);
                res.status(500).send({ error: "Internal server error." });
                return;
            }
        });

        res.status(200).send({ result: true, code: code });
    });

    app.get("/api/user", function(req, res) {
        if (req.session.passport && req.session.passport.user) {
            if (req.session.passport.user.speed_trials_guest_name) {
                res.status(200).send({ result: true, name: req.session.passport.user.speed_trials_guest_name, isTwitchAuthenticated: false });
            } else {
                res.status(200).send({ result: true, name: req.session.passport.user.name, isTwitchAuthenticated: true });
            }
        } else {
            res.status(200).send({ result: true, name: "", isTwitchAuthenticated: false });
        }
    });

    app.post("/api/user", function(req, res) {
        if (req.body["guestName"] === "") {
            // User wants to reset their user credentials
            // Set session.passport to null
            req.session.passport = null;
            res.status(200).send({ result: true });
            return;
        }

        req.checkBody("guestName", 
        "Guest name can contain a-z, A-Z, 0-9 or an underscore, and must be 4 to 25 symbols.")
        .matches("^[a-zA-Z0-9_]{4,25}$");

        var errors = req.validationErrors();
        if (errors) {
            res.status(200).send({ result: false, validationErrors: errors });
            return;
        } else {
            // Empty the passport.user and assign .speed_trials_guest_name
            req.session.passport = {
                user: {
                    speed_trials_guest_name: req.body["guestName"]
                }
            }

            res.status(200).send({ result: true });
        }
    });

    app.get("/api/match/:code", function(req, res) {
        // Public API, return cleaned match data
        // First, validate the code
        req.checkParams("code", "Invalid code.").isAlphanumeric();
        var errors = req.validationErrors();
        if (errors) {
            res.status(200).send({ result: false, validationErrors: errors });
            return;
        }

        matches.findOne({ "code": req.params.code }, (err, doc) => {
            // Clean the user IDs from the users array and the host
            let match = doc;
            match.users = match.users.map((user) => { 
                return { name: user.name, guest: user.guest };
            });
            match.host = new User(match.host.name, match.host.guest);

            res.status(200).send({ result: true, data: match, timestamp: Date.now() });
        });
    });

    // Helper handler function such that all business logic exists in app.js while
    // the server connection etc is handled in server.js
    const io = {
        handleSocketIo: function(io) {
            io.use(sharedsession(sessionObject, {
                autoSave: true
            })); 

            io.sockets.on("connection", function (socket) {
                if (!validateSocket(socket)) {
                    // Validation failed, disconnect the socket
                    socket.disconnect();
                    return;
                } 

                if (config.ENV === "dev") console.log("socket connected", socket.id);

                socket.on("disconnect", function() {
                    // User disconnected
                    if (config.ENV === "dev") console.log("user disconnected", socket.id);

                    // Remove them from all rooms (if necessary)
                });

                socket.on("connect-match-code", function(code) {
                    let disconnected = false; // Set to true if disconnected and unable to return
                    if (!validateSocket(socket)) {
                        // Validation failed, disconnect the socket
                        socket.disconnect();
                        return;
                    }

                    // User requests access to the match
                    // Sanitize the input first
                    if (!validator.isAlphanumeric(code) || !validator.isLength(code, { min: 7, max: 7 })) {
                        socket.disconnect();
                        return;
                    }

                    // If user provided a bad match code, disconnect them
                    matches.findOne({ "code": code }, (err, doc) => {
                        if (doc === null) {
                            socket.disconnect();
                            return;
                        }
                        
                        let match = doc;

                        // Otherwise, assign them to the correct room
                        let roomName = "room-" + code;
                        socket.join(roomName);

                        let newUser = getUserObject(socket.handshake.session, socket.handshake.sessionID);
                        
                        // If user is not already in the match, add them and update the match
                        let found = match.users.findIndex(user => user.id === newUser.id);

                        if (found === -1) {
                            matches.update({ "code": code }, 
                            { $push: { users: newUser } }, 
                            { returnUpdatedDocs: true }, 
                            (err, numAffected, affectedDocuments, upsert) => {
                                // Tell whole room to get newest match info
                                io.in(roomName).emit("match-updated"); 
                            });
                        } else {
                            // If user is already in match, just tell them to get new match data
                            socket.emit("match-updated"); 
                        }
                        
                    });

                    // socket.on("connect-match-code")...
                });

                // io.sockets.on("connection")...
            });

        }
    };



    return {app: app, io: io};
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

function validateUser(session) {
    if (session.passport && session.passport.user) {
        if (session.passport.user.speed_trials_guest_name) {
            return { valid: true, name: session.passport.user.speed_trials_guest_name, guest: true };
        }

        if (session.passport.user.name) {
            return { valid: true, name: session.passport.user.name, guest: false };
        }
    }
    return { valid: false };
}

function validateSocket(socket) {
    // Check if session exists
    let session = socket.handshake.session;
    if (!session) {
        return false;
    }

    // Check that user is authenticated
    let user = validateUser(session);
    if (!user.valid) {
        return false;
    }

    return true;
}

function getUserObject(session, sessionID) {
    let user = validateUser(session);
    let name = user.name;
    let guest = user.guest;
    let id = user.guest ? 
        session.passport.user._id :
        sessionID;

    return new User(name, guest, id);
}

function getNewMatchCode() {
    var code = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < MATCH_CODE_LENGTH; i++)
      code += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return code;
}
