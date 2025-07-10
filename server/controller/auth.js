const { toTitleCase, validateEmail } = require("../config/function");
const bcrypt = require("bcryptjs");
const userModel = require("../models/users");
const jwt = require("jsonwebtoken");
require("dotenv").config(); // should be at the top
const JWT_SECRET = process.env.JWT_SECRET;
class Auth {
  async isAdmin(req, res) {
    let { loggedInUserId } = req.body;
    try {
      let loggedInUserRole = await userModel.findById(loggedInUserId);
      res.json({ role: loggedInUserRole.userRole });
    } catch {
      res.status(404);
    }
  }

  async allUser(req, res) {
    try {
      let allUser = await userModel.find({});
      res.json({ users: allUser });
    } catch {
      res.status(404);
    }
  }

  /* User Registration/Signup controller  */
  async postSignup(req, res) {
    let { name, email, password, cPassword, userRole, adminCode } = req.body;
    console.log("✅ Extracted:", { name, email, password, cPassword, userRole, adminCode });
    let error = {};
    // Required fields check
    if (!name || !email || !password || !cPassword || !userRole) {
      error = {
        name: !name ? "Field must not be empty" : "",
        email: !email ? "Field must not be empty" : "",
        password: !password ? "Field must not be empty" : "",
        cPassword: !cPassword ? "Field must not be empty" : "",
        userRole: !userRole ? "Please select a role" : "",
      };
      return res.json({ error });
    }

    // Name length check
    if (name.length < 3 || name.length > 25) {
      return res.json({ error: { name: "Name must be 3-25 characters" } });
    }

    // Email & password validation
    if (!validateEmail(email)) {
      return res.json({ error: { email: "Email is not valid" } });
    }

    if (password.length < 8 || password.length > 255) {
      return res.json({ error: { password: "Password must be 8 characters minimum" } });
    }

    if (password !== cPassword) {
      return res.json({
        error: {
          password: "Passwords do not match",
          cPassword: "Passwords do not match",
        },
      });
    }

    // Role check (only allow user or admin)
    if (!["user", "admin"].includes(userRole)) {
      return res.json({ error: { userRole: "Role must be either 'user' or 'admin'" } });
    }

    // ✅ FIXED: Changed userRole to role - If trying to sign up as admin, validate access code
    if (userRole === "admin" && adminCode !== process.env.ADMIN_SECRET_CODE) {
      return res.json({ error: { adminCode: "Invalid Admin Access Code" } });
    }

    try {
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return res.json({ error: { email: "Email already exists" } });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      name = toTitleCase(name);

      const newUser = new userModel({
        name,
        email,
        password: hashedPassword,
        userRole, // role: "admin" or "user"
      });

      await newUser.save();

      return res.json({ success: "Account created successfully. Please login" });
    } catch (err) {
      console.log("🔥 Error while saving user:", err);
      return res.status(500).json({ error: "Something went wrong" });
    }
  }

  /* User Login/Signin controller  */
  async postSignin(req, res) {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.json({
        error: "Fields must not be empty",
      });
    }
    try {
      const data = await userModel.findOne({ email: email });
      if (!data) {
        return res.json({
          error: "Invalid email or password",
        });
      } else {
        const login = await bcrypt.compare(password, data.password);
        if (login) {
          // ✅ FIXED: Changed data.role to data.userRole to match the database field
          const token = jwt.sign(
            { _id: data._id, userRole: data.userRole },
            JWT_SECRET
          );
          const encode = jwt.verify(token, JWT_SECRET);
          return res.json({
            token: token,
            user: encode,
          });
        } else {
          return res.json({
            error: "Invalid email or password",
          });
        }
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: "Something went wrong. Please try again.",
      });
    }
  }
}

const authController = new Auth();
module.exports = authController;