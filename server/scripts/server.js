"use strict";

/**
 * Use bluebird for promises globally
 */
//global.Promise = require("bluebird");

/**
 * Dependencies
 */
const path = require("path");
const chalk = require("chalk");
const config = require("../config/config");

/**
 * Configuration
 */

const ENV = process.env.NODE_ENV;
const APP_NAME = config.APP_NAME;
const SERVER_PORT = config[ENV].SERVER_PORT;
const SERVER_TIMEOUT = config[ENV].SERVER_TIMEOUT;

/**
 * Fix CWD if run from scripts path
 */
const cwd = process.cwd().split(path.sep);
if (cwd.length && cwd[cwd.length - 1] === "scripts") {
    cwd.pop();
    process.chdir(cwd.join(path.sep));
}

/**
 * Error handler
 */
function expressErrorHandler(err) {
    if (err.errno === "EADDRINUSE") {
        console.log(chalk.red("Web server port %s is already in use"), SERVER_PORT);
    }
    else {
        console.log(chalk.red("Web server error:"));
        console.log(chalk.red(err));
    }
    process.exit(-1);
}

/**
 * Log
 */
console.log("Running application", chalk.magenta(APP_NAME),
    "in the", chalk.magenta(ENV), "environment");

/**
 * Initialize express application
 */
console.log("Starting Express server...");
const app = require("../app/app")();

const expressApp = app.app;
const ioApp = require("../app/app-io");
const ioAppParams = app.params; // Passing stuff like sharedsession

const server = expressApp.listen(SERVER_PORT, function() {

    //Skip if no address
    if (!this.address()) {
        return;
    }

    //Determine address
    const host = this.address().address.replace("::", "localhost");
    const port = this.address().port;
    const address = host + ":" + port;

    //Output success message
    console.log(chalk.green("Express server started @"), chalk.magenta(address));
});

// Add socket.io
// Let app.js handle the websockets too, since all business logic is there
const sio = require("socket.io");
const io = sio(server, {
    serveClient: false // do not serve the client file
});
ioApp.handleSocketIo(io, expressApp, ioAppParams);

//Configure and apply error handler
server.timeout = SERVER_TIMEOUT;
server.on("error", expressErrorHandler);

/**
 * Expose app
 */
module.exports = app;
