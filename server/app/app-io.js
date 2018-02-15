
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
            if (!matchValidateSocket(socket)) return;

            if (config.ENV === "dev") console.log("socket connected", socket.id);

            socket.on("disconnect", function() {
                // User disconnected
                if (config.ENV === "dev") console.log("socket disconnected", socket.id);
            });

            /**
             * The host has updated the match, tell others to update
             */
            socket.on("host-update", function(code) {
                if (!matchValidateSocket(socket)) return;
                if (!matchValidateCode(socket, code)) return;

                // If user provided a bad match code, disconnect them
                app.locals.matches.findOne({ "code": code }, (err, doc) => {
                    if (!matchValidateDoc(socket, doc)) return;

                    // Make sure they are the host
                    let match = doc;
                    let user = utils.getUserObject(socket.handshake.session, socket.handshake.sessionID);
                    if (match.host.id !== user.id) {
                        socket.disconnect();
                        return;
                    }
                    
                    // Otherwise, inform the whole room to update (including the host)
                    let roomName = "room-" + code;
                    io.in(roomName).emit("match-updated");
                });
            });

            socket.on("connect-match-code", function(code) {
                if (!matchValidateSocket(socket)) return;
                if (!matchValidateCode(socket, code)) return;

                app.locals.matches.findOne({ "code": code }, (err, doc) => {
                    if (!matchValidateDoc(socket, doc)) return;
                    
                    let match = doc;

                    // Otherwise, assign them to the correct room
                    let roomName = "room-" + code;

                    // Allows updates to be transmitted to this socket even though the user
                    // might not be a participant
                    socket.join(roomName); 

                    let user = utils.getUserObject(socket.handshake.session, socket.handshake.sessionID);

                    // Makes the host immediately join the match, 
                    // others will have to manually participate (or not, to observe)
                    socket.emit("match-connected", { instantJoin: match.host ? user.id === match.host.id : false });
                });

                // socket.on("connect-match-code")...
            });

            socket.on("join-match", function(code) {
                if (!matchValidateSocket(socket)) return;
                if (!matchValidateCode(socket, code)) return;

                app.locals.matches.findOne({ "code": code }, (err, doc) => {
                    if (!matchValidateDoc(socket, doc)) return;
                    
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
                        if (match.host === null) {
                            message = "Unable to join. Match " + code + " has been abandoned and will be removed."
                        } 
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

            socket.on("leave-match", function(code) {
                if (!matchValidateSocket(socket)) return;
                if (!matchValidateCode(socket, code)) return;

                app.locals.matches.findOne({ "code": code }, (err, doc) => {
                    if (!matchValidateDoc(socket, doc)) return;
                    
                    let match = doc;

                    let roomName = "room-" + code;
                    
                    // User has already been validated via validateSocket
                    let user = utils.getUserObject(socket.handshake.session, socket.handshake.sessionID);

                    // If the user is not in the room
                    let found = match.users.findIndex(user => user.id === user.id) !== -1;
                    if (!found) {
                        let message = "Unable to leave match. You are not even in the match!";
                        if (config.ENV === "dev") console.log(message);
                        socket.emit("unable-to-leave", { result: false, errorMessage: message }); 
                        return;
                    }

                    // If the room has started, do not allow leaving
                    if (match.started) {
                        let message = "Unable to leave. Match " + code + " has already started.";
                        if (config.ENV === "dev") console.log(message);
                        socket.emit("unable-to-leave", { result: false, errorMessage: message }); 
                        return;
                    }

                    // Otherwise remove them from the match and leave the room socket. 
                    // The user will disconnect their own socket when they leave the page
                    app.locals.matches.update(
                        { "code": code }, 
                        { $pull: { "users": user } }, 
                        { returnUpdatedDocs: true }, 
                        (err, numAffected, affectedDocuments) => {
                            // If user was host, assign the next player as host
                            // If there are no players left, disable joining and make the host null
                            if (affectedDocuments.users.length > 0) { // Users still left in the match
                                if (user.id === match.host.id) {
                                    // Assign the first user in the new affectedDocuments as the host.
                                    let newHost = affectedDocuments.users[0];

                                    app.locals.matches.update(
                                        { "code": code }, 
                                        { $set: { "host": newHost } }, 
                                        { }, 
                                        (err, numAffected) => {
                                            if (config.ENV === "dev") console.log("User left match", code, "assigned new host");

                                            // Make the leaving user leave the room, inform others to pull new data
                                            socket.leave(roomName);
                                            socket.emit("leave-match-confirm");
                                            io.in(roomName).emit("match-updated");
                                    });
                                } else {
                                    if (config.ENV === "dev") console.log("User left match", code);

                                    // Just make the player leave, tell the room to update the match
                                    socket.leave(roomName);
                                    socket.emit("leave-match-confirm");
                                    io.in(roomName).emit("match-updated");
                                }
                            } else { // No more users remaining in the room
                                // Do not allow joining the match
                                affectedDocuments.host = null;
                                affectedDocuments.allowJoin = false;

                                app.locals.matches.update(
                                    { "code": code }, 
                                    affectedDocuments, 
                                    { }, 
                                    (err, numAffected) => {
                                        if (config.ENV === "dev") console.log("User left match", code, "Match is now empty, disable joining and assign host to null");

                                        // Make the leaving user leave the room
                                        socket.leave(roomName);
                                        socket.emit("leave-match-confirm");
                                });
                            }
                    });


                });

                // socket.on("leave-match")...
            });

            // io.sockets.on("connection")...
        });

    }
};

// Helper functions for validating the connecting session and given match code input
function matchValidateSocket(socket) {
    if (!utils.validateSocket(socket)) {
        // Validation failed, disconnect the socket
        if (config.ENV === "dev") console.log("Invalid user in socket", );
        socket.disconnect();
        return false;
    }

    return true;
}

function matchValidateCode(socket, code) {
    // User requests access to the match
    // Sanitize the input first
    if (!validator.isAlphanumeric(code) || !validator.isLength(code, { min: 7, max: 7 })) {
        if (config.ENV === "dev") console.log("Invalid connect match code");
        socket.disconnect();
        return false;
    }

    return true;
}

function matchValidateDoc(socket, doc) {
    // If user provided a bad match code (doc not found in db), disconnect them
    if (doc === null) {
        if (config.ENV === "dev") console.log("Socket tried to connect to a nonexisting match");
        socket.disconnect();
        return false;
    }
    
    return true;
}

module.exports = ioApp;