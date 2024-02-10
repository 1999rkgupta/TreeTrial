import axios from "axios";

let AxiosInstance = axios.create({
  baseURL: "http://106.51.74.69:9797/api",
  headers: {
    Authorization: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBfaWQiOjUsImV4cCI6MTc3MjM4NDM3Miwic3ViIjoxMzA3fQ.NNmxakyjhuZ8A135jYnvXCSB-3V4A7YZEUih7GVA9rc`,
    "Content-type": "application/json",
  },
});

export default AxiosInstance;
