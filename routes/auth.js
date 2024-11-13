const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

// Importing response helper
const responseModel = require("../helpers/responseModel");

// REGISTER
router.post(
  "/register",
  // Validation checks
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    // Check if there were validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseModel.error(res, "Validation failed", 400, { errors: errors.array() });
    }

    try {
      // Check if the username or email already exists
      const existingUser = await User.findOne({
        $or: [{ username: req.body.username }, { email: req.body.email }],
      });

      if (existingUser) {
        return responseModel.error(res, "Username or email already exists", 400, { existingUser });
      }

      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SEC).toString(),
      });

      const savedUser = await newUser.save();
      responseModel.success(res, savedUser, "User registered successfully", 201);
    } catch (err) {
      responseModel.error(res, "Server error", 500, { error: err.message });
    }
  }
);

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({
      userName: req.body.user_name,
    });

    if (!user) {
      return responseModel.error(res, "Wrong User Name", 401, {});
    }

    const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_SEC);
    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
    const inputPassword = req.body.password;

    if (originalPassword !== inputPassword) {
      return responseModel.error(res, "Wrong Password", 401, {});
    }

    const accessToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SEC,
      { expiresIn: "3d" }
    );

    const { password, ...others } = user._doc;
    responseModel.success(res, { ...others, accessToken }, "Login successful", 200);
  } catch (err) {
    responseModel.error(res, "Server error", 500, { error: err.message });
  }
});

module.exports = router;