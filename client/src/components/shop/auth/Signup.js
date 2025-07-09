import React, { Fragment, useState } from "react";
import { signupReq } from "./fetchApi";

const Signup = (props) => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    cPassword: "",
    role: "user", // or donor/admin
    adminCode: "",
    error: false,
    loading: false,
    success: false,
  });

  const alert = (msg, type) => (
    <div className={`text-sm text-${type}-500`}>{msg}</div>
  );

  const formSubmit = async () => {
    setData({ ...data, loading: true });

    if (data.cPassword !== data.password) {
      return setData({
        ...data,
        loading: false,
        error: {
          cPassword: "Password doesn't match",
          password: "Password doesn't match",
        },
      });
    }

    try {
      let responseData = await signupReq({
        name: data.name,
        email: data.email,
        password: data.password,
        cPassword: data.cPassword,
        userRole: data.role,
        adminCode: data.adminCode,
      });

      if (responseData.error) {
        setData({
          ...data,
          loading: false,
          error: responseData.error,
          password: "",
          cPassword: "",
        });
      } else if (responseData.success) {
        setData({
          success: responseData.success,
          name: "",
          email: "",
          password: "",
          cPassword: "",
          role: "user",
          adminCode: "",
          loading: false,
          error: false,
        });
        alert("✅ Account created successfully. Please login.");
      }
    } catch (error) {
      console.log(error);
      setData({
        ...data,
        loading: false,
        error: { general: "An error occurred during signup" },
      });
    }
  };

  return (
    <Fragment>
      <div className="text-center text-2xl mb-6">Register Hospital</div>
      <form className="space-y-4">
        {data.success ? alert(data.success, "green") : ""}

        {/* Name */}
        <div className="flex flex-col">
          <label htmlFor="name">Name<span className="text-sm text-gray-600 ml-1">*</span></label>
          <input
            onChange={(e) => setData({ ...data, success: false, error: {}, name: e.target.value })}
            value={data.name}
            type="text"
            id="name"
            autoComplete="name"
            className={`${data.error.name ? "border-red-500" : ""} px-4 py-2 focus:outline-none border`}
          />
          {data.error.name && alert(data.error.name, "red")}
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label htmlFor="email">Email address<span className="text-sm text-gray-600 ml-1">*</span></label>
          <input
            onChange={(e) => setData({ ...data, success: false, error: {}, email: e.target.value })}
            value={data.email}
            type="email"
            id="email"
            autoComplete="email"
            className={`${data.error.email ? "border-red-500" : ""} px-4 py-2 focus:outline-none border`}
          />
          {data.error.email && alert(data.error.email, "red")}
        </div>

        {/* Password */}
        <div className="flex flex-col">
          <label htmlFor="password">Password<span className="text-sm text-gray-600 ml-1">*</span></label>
          <input
            onChange={(e) => setData({ ...data, success: false, error: {}, password: e.target.value })}
            value={data.password}
            type="password"
            id="password"
            autoComplete="new-password"
            className={`${data.error.password ? "border-red-500" : ""} px-4 py-2 focus:outline-none border`}
          />
          {data.error.password && alert(data.error.password, "red")}
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col">
          <label htmlFor="cPassword">Confirm password<span className="text-sm text-gray-600 ml-1">*</span></label>
          <input
            onChange={(e) => setData({ ...data, success: false, error: {}, cPassword: e.target.value })}
            value={data.cPassword}
            type="password"
            id="cPassword"
            autoComplete="new-password"
            className={`${data.error.cPassword ? "border-red-500" : ""} px-4 py-2 focus:outline-none border`}
          />
          {data.error.cPassword && alert(data.error.cPassword, "red")}
        </div>

        {/* Role Dropdown */}
        <div className="flex flex-col">
          <label htmlFor="userRole">Register as<span className="text-sm text-gray-600 ml-1">*</span></label>
          <select
            id="userRole"
            value={data.role}
            onChange={(e) => setData({ ...data, success: false, error: {}, role: e.target.value })}
            className="px-4 py-2 focus:outline-none border"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Admin Access Code Input (only when admin selected) */}
        {data.role === "admin" && (
          <div className="flex flex-col">
            <label htmlFor="adminCode">Admin Access Code<span className="text-sm text-gray-600 ml-1">*</span></label>
            <input
              onChange={(e) => setData({ ...data, success: false, error: {}, adminCode: e.target.value })}
              value={data.adminCode}
              type="password"
              id="adminCode"
              className={`${data.error.adminCode ? "border-red-500" : ""} px-4 py-2 focus:outline-none border`}
            />
            {data.error.adminCode && alert(data.error.adminCode, "red")}
          </div>
        )}

        {/* Remember me & forgot */}
        <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center">
          <div>
            <input type="checkbox" id="rememberMe" className="px-4 py-2 focus:outline-none border mr-1" />
            <label htmlFor="rememberMe">Remember me<span className="text-sm text-gray-600">*</span></label>
          </div>
          <a className="block text-gray-600" href="/">Forgot your password?</a>
        </div>

        {/* Submit */}
        <div
          onClick={formSubmit}
          style={{ background: "#303031" }}
          className={`px-4 py-2 text-white text-center cursor-pointer font-medium ${
            data.loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {data.loading ? "Creating account..." : "Create an account"}
        </div>

        {data.error.general && alert(data.error.general, "red")}
      </form>
    </Fragment>
  );
};

export default Signup;
