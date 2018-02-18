let baseUrl = "";

if (process.env.NODE_ENV === "production") {
    baseUrl = "http://139.59.213.16";
} else {
    baseUrl = "http://localhost:8081";
}

export const config = {
    serverHost: baseUrl
};
