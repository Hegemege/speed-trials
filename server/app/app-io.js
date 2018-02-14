
var validator = require("validator");

var config = require("../config/config");
var utils = require("./utils");
var Models = require("./models");

// Socket IO shared session with express
var sharedsession = require("express-socket.io-session");

const ioApp = {
    handleSocketIo: function(io, app, params) {
        io.use(sharedsession(params.sessionObject, {
            autoSave: true
        })); 

        io.sockets.on("connection", function (socket) {
            if (!utils.validateSocket(socket)) {
                // Validation failed, disconnect the socket
                socket.disconnect();
                return;
            } 

            if (config.ENV === "dev") console.log("socket connected", socket.id);

            socket.on("disconnect", function() {
                // User disconnected
                if (config.ENV === "dev") console.log("socket disconnected", socket.id);

                // Remove them from all rooms (if necessary)
            });

            /**
             * The host has updated the match, tell others to update
             */
            socket.on("host-update", function(code) {
                if (!utils.validateSocket(socket)) {
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
                app.locals.matches.findOne({ "code": code }, (err, doc) => {
                    if (doc === null) {
                        socket.disconnect();
                        return;
                    }

                    // Make sure they are the host
                    let match = doc;
                    let user = utils.getUserObject(socket.handshake.session, socket.handshake.sessionID);
                    if (match.host.id !== user.id) {
                        socket.disconnect();
                        return;
                    }
                    
                    // Otherwise, assign them to the correct room
                    let roomName = "room-" + code;
                    io.in(roomName).emit("match-updated");
                });
            });

            socket.on("connect-match-code", function(code) {
                let disconnected = false; // Set to true if disconnected and unable to return
                if (!utils.validateSocket(socket)) {
                    // Validation failed, disconnect the socket
                    if (config.ENV === "dev") console.log("Invalid user in socket", );
                    socket.disconnect();
                    return;
                }

                // User requests access to the match
                // Sanitize the input first
                if (!validator.isAlphanumeric(code) || !validator.isLength(code, { min: 7, max: 7 })) {
                    if (config.ENV === "dev") console.log("Invalid connect match code");
                    socket.disconnect();
                    return;
                }

                app.locals.matches.findOne({ "code": code }, (err, doc) => {
                    // If user provided a bad match code, disconnect them
                    if (doc === null) {
                        if (config.ENV === "dev") console.log("Socket tried to connect to a nonexisting match");
                        socket.disconnect();
                        return;
                    }
                    
                    let match = doc;

                    // Otherwise, assign them to the correct room
                    let roomName = "room-" + code;

                    // Allows updates to be transmitted to this socket even though the user
                    // might not be a participant
                    socket.join(roomName); 

                    let user = utils.getUserObject(socket.handshake.session, socket.handshake.sessionID);

                    // Makes the host immediately join the match, 
                    // others will have to manually participate (or not, to observe)
                    socket.emit("match-connected", { instantJoin: user.id === match.host.id });
                });

                // socket.on("connect-match-code")...
            });

            socket.on("join-match", function(code) {
                let disconnected = false; // Set to true if disconnected and unable to return
                if (!utils.validateSocket(socket)) {
                    // Validation failed, disconnect the socket
                    if (config.ENV === "dev") console.log("Invalid user in socket", );
                    socket.disconnect();
                    return;
                }

                // User requests access to the match
                // Sanitize the input first
                if (!validator.isAlphanumeric(code) || !validator.isLength(code, { min: 7, max: 7 })) {
                    if (config.ENV === "dev") console.log("Invalid connect match code");
                    socket.disconnect();
                    return;
                }

                app.locals.matches.findOne({ "code": code }, (err, doc) => {
                    // If user provided a bad match code, disconnect them
                    if (doc === null) {
                        if (config.ENV === "dev") console.log("Socket tried to connect to a nonexisting match");
                        socket.disconnect();
                        return;
                    }
                    
                    let match = doc;

                    let roomName = "room-" + code;

                    // User has already been validated via validateSocket
                    let newUser = utils.getUserObject(socket.handshake.session, socket.handshake.sessionID);

                    // If the room has not started, add the user to the participants list
                    if (match.started) {
                        let message = "Unable to join. Match " + code + " has already started."
                        if (config.ENV === "dev") console.log(message);
                        socket.emit("unable-to-join", { result: false, errorMessage: message }); 
                        return;
                    }

                    // Check if match joining has been disabled
                    if (!match.allowJoin) {
                        let message = "Unable to join. Match " + code + " has disallowed joining."
                        if (config.ENV === "dev") console.log(message);
                        socket.emit("unable-to-join", { result: false, errorMessage: message }); 
                        return;
                    }

                    // If user is not already in the match, add them and update the match
                    let found = match.users.findIndex(user => user.id === newUser.id);

                    if (found === -1) {
                        app.locals.matches.update({ "code": code }, 
                        { $push: { users: newUser } }, 
                        { }, 
                        (err, numAffected) => {
                            // Tell whole room to get newest match info
                            io.in(roomName).emit("match-updated"); 
                        });
                    } else {
                        // If user is already in match, just tell them to get new match data without having to inform others
                        if (config.ENV === "dev") console.log("User is already in match.");
                        socket.emit("match-updated"); 
                    }
                    
                });

                // socket..on("join-match")...
            });

            // io.sockets.on("connection")...
        });

    }
};

module.exports = ioApp;