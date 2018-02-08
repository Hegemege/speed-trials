let baseUrl = "";

if (process.env.NODE_ENV === "production") {
    baseUrl = "https://TODO/api/";
}
else {
    baseUrl = "http://localhost:8081";
}

export const apiHost = baseUrl;