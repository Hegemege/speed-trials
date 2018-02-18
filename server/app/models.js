class Match {
    constructor(name, code, host) {
        this.name = name;
        this.code = code;
        this.host = host; // Host user
        this.users = []; // List of all users
        this.mapPool = ""; // Chosen mappool name
        this.started = false;
        this.ended = false;
        this.allowJoin = true;
    }
}

class User {
    constructor(name, guest, id) {
        this.name = name; // Current username
        this.guest = guest;

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