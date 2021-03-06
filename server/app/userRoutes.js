var express = require('express');
var router = express.Router();

var config = require("../config/config");
var utils = require("./utils");
var Models = require("./models");

// API routes that handle users
// Getting user info on front page
// Will return { result: true, name: "", isTwitchAuthenticated: false } by default on new users
router.get("/", function(req, res) {
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

// Guest join
router.post("/", function(req, res) {
    if (req.body["guestName"] === "") {
        // User wants to reset their user credentials
        // Destroy the session and regenerate a new one for them
        req.session.destroy(() => {
            // Empty callback, otherwise NeDB breaks?
        });
        res.status(200).send({ result: true });
        return;
    }

    req.checkBody("guestName", 
        "Guest name can contain a-z, A-Z, 0-9 or an underscore, and must be 3 to 25 symbols long.")
        .matches(/^[a-zA-Z0-9_]{3,25}$/);

    var errors = req.validationErrors();
    if (errors) {
        res.status(400).send({ result: false, validationErrors: errors });
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

module.exports = router;