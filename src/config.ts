let baseUrl = "";

if (process.env.NODE_ENV === "production") {
    baseUrl = "https://trials.speedrunbets.com";
} else {
    baseUrl = "http://localhost:8081";
}

export const config = {
    serverHost: baseUrl
};
