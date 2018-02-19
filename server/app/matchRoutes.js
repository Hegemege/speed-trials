var express = require('express');
var router = express.Router();

var config = require("../config/config");
var utils = require("./utils");
var Models = require("./models");




// API routes that handle matches
router.post("/exists/:code", function(req, res) {
    let user = utils.getUserObject(req.session, req.sessionID);
    if (!utils.validateLoggedIn(user)) return;

    if (!utils.validateMatchCodeParam(req, res)) return;

    let code = req.params.code;

    req.app.locals.matches.find({ code: code }, (err, docs) => {
        if (err) {
            console.log("Error while finding match by code " + code + ": " + err);
            res.status(500).send({ result: false, error: "Internal server error."});
            return;
        }
        if (docs.length === 0) {
            res.status(400).send({ result: false, error: "Match with code \"" + code + "\" not found" });
            return;
        }

        // Will return the code to be used to join
        // Otherwise a user might accidentally type more letters while joining if using a client code
        res.status(200).send({ result: true, code: code }); 
    });
});




router.post("/create", function(req, res) {
    let user = utils.getUserObject(req.session, req.sessionID);
    if (!utils.validateLoggedIn(user)) return;

    // Users can create matches in dev mode
    if (user.guest && config.ENV !== "dev") {
        res.status(403).send({ 
            result: false,
            error: "Guests can not create matches. Please log out from the navigation bar, and log back in via Twitch." 
        });
        return;
    }

    let code = utils.getNewMatchCode();
    let match = new Models.Match("Match " + code, code, user);

    // First test if code is already in use.
    // 1 in 64^7 chance, we need to celebrate it!
    req.app.locals.matches.find({ code: code }, (err, docs) => {
        if (err) {
            console.log("Error while finding match by code " + code + ": " + err);
            res.status(500).send({ result: false, error: "Internal server error."});
            return;
        }
        if (docs.length !== 0) {
            res.status(400).send({ result: false, error: "Jackpot! Room already exists. That's a 1 in 64^7 chance!" });
            return;
        }

        req.app.locals.matches.insert(match, (err, docs) => {
            if (err) {
                console.log("Error while inserting match:", match, ":", err);
                res.status(500).send({ result: false, error: "Internal server error." });
                return;
            } else {
                res.status(200).send({ result: true, code: code });
            }
        });
    });
});




router.post("/rename/:code", function(req, res) {
    let user = utils.getUserObject(req.session, req.sessionID);
    if (!utils.validateLoggedIn(user)) return;

    if (!utils.validateMatchCodeParam(req, res)) return;

    // Validate the new name
    req.checkBody("name", 
        "Match name can contain a-z, A-Z, 0-9, -, _ or a space and must be 1 to 100 symbols long.")
        .matches(/^[a-zA-Z0-9_\-\s]{1,100}$/);

    var errors = req.validationErrors();
    if (errors) {
        res.status(400).send({ result: false, validationErrors: errors });
        return;
    }

    // Update the name to DB and inform everyone in the room
    let name = req.body["name"];

    req.app.locals.matches.findOne({ "code": req.params.code }, (err, doc) => {
        if (!doc || err) {
            res.status(400).send({result: false, error: "Match not found" });
            return;
        }

        // Make sure the user is the host of the match
        let match = doc;

        if (match.host.id !== user.id) {
            res.status(400).send({ result: false, error: "You are not the host" });
            return;
        }

        // Update the match and save it to DB
        match.name = name;
        req.app.locals.matches.update({ "code": req.params.code }, { $set: { "name": name } }, (err, numAffected) => {
            if (err || numAffected !== 1) {
                res.status(500).send({ result: false, error: "Internal server error" });
                console.log("Unable to update match", req.params.code, ":", err, "numAffected", numAffected);
                return;
            }

            res.status(200).send({ result: true });
        });
    });
});




router.post("/allow-join/:code", function(req, res) {
    let user = utils.getUserObject(req.session, req.sessionID);
    if (!utils.validateLoggedIn(user)) return;

    if (!utils.validateMatchCodeParam(req, res)) return;

    // Validate the new name
    req.checkBody("allow", "Internal server error").isBoolean();

    var errors = req.validationErrors();
    if (errors) {
        res.status(400).send({ result: false, validationErrors: errors });
        return;
    }

    let allowJoin = req.body["allow"];

    req.app.locals.matches.findOne({ "code": req.params.code }, (err, doc) => {
        if (!doc || err) {
            res.status(400).send({result: false, error: "Match not found" });
            return;
        }

        // Make sure the user is the host of the match
        let match = doc;

        if (match.host.id !== user.id) {
            res.status(400).send({ result: false, error: "You are not the host" });
            return;
        }

        // Update it to DB
        req.app.locals.matches.update({ "code": req.params.code }, { $set: { "allowJoin": allowJoin } }, (err, numAffected) => {
            if (err || numAffected !== 1) {
                res.status(500).send({ result: false, error: "Internal server error" });
                console.log("Unable to update match", req.params.code, ":", err, "numAffected", numAffected);
                return;
            }

            res.status(200).send({ result: true });
        });
    });
});




router.post("/mappool/:code", function(req, res) {
    let user = utils.getUserObject(req.session, req.sessionID);
    if (!utils.validateLoggedIn(user)) return;

    if (!utils.validateMatchCodeParam(req, res)) return;

    // Validate the new name
    req.checkBody("mapPoolId", "No map pool id given");

    var errors = req.validationErrors();
    if (errors) {
        res.status(400).send({ result: false, validationErrors: errors });
        return;
    }

    let mapPoolId = req.body["mapPoolId"];

    req.app.locals.matches.findOne({ "code": req.params.code }, (err, doc) => {
        if (!doc || err) {
            res.status(400).send({result: false, error: "Match not found" });
            return;
        }

        // Make sure the user is the host of the match
        let match = doc;

        if (match.host.id !== user.id) {
            res.status(400).send({ result: false, error: "You are not the host" });
            return;
        }

        // Update it to DB
        req.app.locals.matches.update({ "code": req.params.code }, { $set: { "mapPool": mapPoolId } }, (err, numAffected) => {
            if (err || numAffected !== 1) {
                res.status(500).send({ result: false, error: "Internal server error" });
                console.log("Unable to update match", req.params.code, ":", err, "numAffected", numAffected);
                return;
            }

            res.status(200).send({ result: true });
        });
    });
});




router.get("/:code", function(req, res) {
    // First, validate the code
    if (!utils.validateMatchCodeParam(req, res)) return;

    let currentUser = utils.getUserObject(req.session, req.sessionID);
    if (!utils.validateLoggedIn(currentUser)) return;

    req.app.locals.matches.findOne({ "code": req.params.code }, (err, doc) => {
        if (!doc || err) {
            res.status(400).send({ error: "Match not found" });
            return;
        }

        // Clean the user IDs from the users array and the host (if it exists)
        let match = doc;
        let hostId = match.host ? match.host.id : null;

        match.users = match.users.map((user) => { 
            return { 
                name: user.name, 
                guest: user.guest, 
                host: user.id === hostId, 
                you: user.id === currentUser.id 
            };
        });

        // Strip away the match host id if the host exists
        match.host = match.host ? new Models.User(match.host.name, match.host.guest) : match.host;

        res.status(200).send({ 
            result: true, 
            data: match, 
            timestamp: Date.now(), 
            isHost: currentUser.id === hostId
        });
    });
});

module.exports = router;