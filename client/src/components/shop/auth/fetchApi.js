import axios from "axios";

const apiURL = process.env.REACT_APP_API_URL || "http://localhost:8000";
console.log(">> fetchApi.js using:", apiURL);

export const isAuthenticate = () =>
  localStorage.getItem("jwt") ? JSON.parse(localStorage.getItem("jwt")) : false;

export const isAdmin = () =>
  localStorage.getItem("jwt")
    ? JSON.parse(localStorage.getItem("jwt")).user.userRole === "admin"
    : false;


export const loginReq = async ({ email, password }) => {
  const data = { email, password };
  try {
    let res = await axios.post(`${apiURL}/api/signin`, data);
    return res.data;
  } catch (error) {
    console.error("❌ Login API error:", error);
    if (error.response && error.response.data) {
      return { error: error.response.data.error || "Login request failed" };
    }
    return { error: "Login request failed" };
  }
};

// Fixed: Changed userRole to role and added adminCode parameter
export const signupReq = async ({ name, email, password, cPassword, userRole, adminCode }) => {
  const data = { name, email, password, cPassword, userRole, adminCode };
  const url = `${apiURL}/api/signup`;
  console.log("🔍 Signup URL →", url);
  console.log("🔍 Signup Data →", data);
  
  try {
    let res = await axios.post(url, data);
    return res.data;
  } catch (error) {
    console.error("❌ Signup API error:", error);
    if (error.response && error.response.data) {
      return { error: error.response.data.error || "Signup request failed" };
    }
    return { error: "Signup request failed" };
  }
};