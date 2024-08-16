import axios from "axios";

const HOST = "192.168.2.14";
const portWS = 8080;
const portAPI = 3000;

const API_URL = `http://${HOST}:${portAPI}/api`;


export const endpoints = {
    "update": "/threshold",
    "get": "/threshold"
}

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

export {HOST, portWS, apiClient};
