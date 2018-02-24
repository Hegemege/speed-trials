class Match {
    constructor(name, code, host) {
        this.name = name;
        this.code = code;
        this.host = host; // Host user
        this.originalHost = host; // Just for logging purposes
        this.users = []; // List of all users
        this.mapPool = ""; // Chosen mappool Id (from mappools.db)
        this.started = false;
        this.ended = false;
        this.allowJoin = true;
        this.private = true; // All matches are private by default
        this.settings = {
            mapsPlayed: 0,
            scoringMode: "total", 
            // Scoring methods:
            //     total: Score is calculated as lowest total time across all maps
            //     individual: Score is calculated based on individual wins on each map. 
            //                 If multiple participants,
            //                 1st place - 3 points, 
            //                 2nd place - 2 points,
            //                 3rd place - 1 point
        };
        this.submissions = [
            // Objects of format: 
            /*
                {
                    map: "",
                    userId: id,
                    time: time in milliseconds
                }
            */
        ];
    }
}

class User {
    constructor(name, guest, id) {
        this.name = name; // Current username
        this.guest = guest;
        this.ready = false;

        // Twitch ID. null if guest
        // In dev mode, sessionID will be used
        // Does not expose the field if the class is used for cleaned data without IDs
        if (id !== undefined) { 
            this.id = id; 
        }
    }
}

module.exports = {
    Match: Match,
    User: User
}