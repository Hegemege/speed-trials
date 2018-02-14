
var config = require("../config/config");
var Models = require("./models");

let utils = {
    isNumeric: function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
    
    /*
     * Validates a given field of the request body.
     * The body must contain the field, and if numeric = True,
     * the field string must resolve to a valid number.
     */
    validate: function(req, res, field, numeric) {
        if (req.body[field] === undefined) {
            res.status(400).send({ error: field + " not found in request body" });
            return false;
        }
    
        if (numeric && !isNumeric(req.body[field])) {
            res.status(400).send({ error: field + " is not numeric" });
            return false;
        }
    
        return true;
    },
    
    validateUser: function(session) {
        if (session.passport && session.passport.user) {
            if (session.passport.user.speed_trials_guest_name) {
                return { valid: true, name: session.passport.user.speed_trials_guest_name, guest: true };
            }
    
            if (session.passport.user.name) {
                return { valid: true, name: session.passport.user.name, guest: false };
            }
        }
        return { valid: false };
    },
    
    validateLoggedIn: function(userObject, res) {
        if (userObject === null) {
            res.status(403).send({ result: false, error: "User is not logged in" });
            return false;
        }
    
        return true;
    },
    
    validateMatchCodeParam: function(req, res) {
        req.checkParams("code", "Invalid code. Match codes are alphanumeric 7-symbol combinations")
            .isAlphanumeric()
            .isLength({ min: 7, max: 7 });
        let errors = req.validationErrors();
        if (errors) {
            res.status(400).send({ result: false, validationErrors: errors });
            return false;
        }
        return true;
    },
    
    validateSocket: function(socket) {
        // Check if session exists
        let session = socket.handshake.session;
        if (!session) {
            return false;
        }
    
        // Check that user is authenticated
        let user = utils.validateUser(session);
        if (!user.valid) {
            return false;
        }
    
        return true;
    },
    
    getUserObject: function(session, sessionID) {
        let user = utils.validateUser(session);
        if (!user.valid) return null;
    
        let name = user.name;
        let guest = user.guest;
        let id = user.guest ? 
            session.passport.user._id :
            sessionID;
    
        return new Models.User(name, guest, id);
    },
    
    getNewMatchCode: function() {
        var code = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      
        for (var i = 0; i < MATCH_CODE_LENGTH; i++)
          code += possible.charAt(Math.floor(Math.random() * possible.length));
      
        return code;
    }  
};

module.exports = utils;