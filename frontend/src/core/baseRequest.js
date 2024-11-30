import axios from "axios";
import { IP } from "../env.js";

const baseUrl = "http://" + IP;
//baseUrl = "http://localhost:4000"

const baseRequest = {
  request: (method, path, params, onDownloadProgress, responseType) => {
    if (!window.navigator.onLine) {
      console.log("No internet!");
    } else {
      return axios({
        method,
        url: baseUrl + path,
        data: params,
      });
    }
  },
  multiPartPost: (path, form) => {
    return axios.post(baseUrl + path, form, {
      headers: {
        "content-type": "multipart/form-data;",
      },
    });
  },
  post: (path, params) => {
    return baseRequest.request("POST", path, params);
  },
  put: (path, params) => {
    return baseRequest.request("PUT", path, params);
  },
  update: (path, params) => {
    return baseRequest.request("UPDATE", path, params);
  },
  delete: (path, params) => {
    return baseRequest.request("DELETE", path, params);
  },
  get: (path, params) => {
    return axios.get(baseUrl + path, params);
  },
  addHeader: (data) => {
    axios.defaults.headers.common["Authorization"] = "Header " + data;
  },
  addToken: (token) => {
    const sessiontoken = localStorage.getItem("token");
    axios.defaults.headers.common["Authorization"] = token || sessiontoken;
  },
};

baseRequest.addToken();
export default baseRequest;
