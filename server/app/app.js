const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const uuidv4 = require('uuid/v4');
const cors = require('cors')

const Datastore = require("nedb");
const dbDefaults = require("./dbDefaults");

class Trial {
    constructor(name, joinCode, host) {
        this.name = name;
        this.joinCode = joinCode;
        this.host = host;
        this.players = [host];
        this.mapPool = [];
    }
}

module.exports = function() {
    const app = express();
    app.use(bodyParser.json());
    app.use(cors());

    // All DBs
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
        console.log(req.body);
        res.status(200).send({ message: "success" });
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
