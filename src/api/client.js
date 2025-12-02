import axios from "axios";

// Central axios instance for all backend calls
const client = axios.create({
    baseURL: "/api", // proxied to http://localhost:8080/api
    headers: {
        "Content-Type": "application/json",
    },
});

export default client;
