"use strict";

/**
 * Get package info and server port
 */
const pkg = require("../package.json");

let secrets = {}
try {
    secrets = require("./secrets");
}
catch (ex) {
    console.error("Twitch API keys (client secret) missing from /config/secrets.js.");
    console.error(`
    Example file: ./config/secrets.js

    module.exports = {
        dev: {
            cookieSecret: "abcdefg",
            twitchClientSecret: "abcdefg"
        },
        production: {
            cookieSecret: "abcdefg",
            twitchClientSecret: "abcdefg"
        },
    };
    
    `);
    throw("Cannot run speedtrials server without Twitch API keys, see console error above.");
}


/**
 * Environment configuration
 */
module.exports = {
    //App
    APP_NAME: pkg.name,
    APP_VERSION: pkg.version,
    ENV: process.env.NODE_ENV,
    dev: {
        // API
        // Twitch integration
        twitchClientId: "6ef9r2564g08s6637v92i095zy142c",
        twitchClientSecret: secrets["dev"]["twitchClientSecret"],
        twitchClientCallbackUri: "http://localhost:8081",
        twitchScope: "",

        // Cookie secret
        cookieSecret: secrets["dev"]["cookieSecret"],

        // Server
        SERVER_PORT: 8081,
        SERVER_TIMEOUT: 120000,
    },
    production: {
        // API
        // Twitch integration
        twitchClientId: "6ef9r2564g08s6637v92i095zy142c",
        twitchClientSecret: secrets["production"]["twitchClientSecret"],
        twitchClientCallbackUri: "TODO",
        twitchScope: "",

        // Cookie secret
        cookieSecret: secrets["production"]["cookieSecret"],

        // Server
        SERVER_PORT: process.env.PORT || 8080,
        SERVER_TIMEOUT: 120000,
    },
};
