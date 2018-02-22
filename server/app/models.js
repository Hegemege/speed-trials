class Match {
    constructor(name, code, host) {
        this.name = name;
        this.code = code;
        this.host = host; // Host user
        this.users = []; // List of all users
        this.mapPool = ""; // Chosen mappool Id (from mappools.db)
        this.started = false;
        this.ended = false;
        this.allowJoin = true;
        this.private = true; // All matches are private by default
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