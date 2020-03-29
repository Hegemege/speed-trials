let baseUrl = "";

if (process.env.NODE_ENV === "production") {
    baseUrl = "https://jkruns.tk";
} else {
    baseUrl = "http://localhost:8081";
}

export const config = {
    serverHost: baseUrl
};
