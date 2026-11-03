const express = require("express");
const { login, me, register } = require("../controllers/authController");
const { requireAuth, requireRole } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

const router = express.Router();

const loginSchema = {
  email: { required: true, type: "string", email: true, max: 160 },
  password: { required: true, type: "string", min: 8, max: 100 },
};

const registerSchema = {
  name: { required: true, type: "string", min: 2, max: 120 },
  email: { required: true, type: "string", email: true, max: 160 },
  password: { required: true, type: "string", min: 8, max: 100 },
};

router.post("/login", validate(loginSchema), login);
router.post("/register", requireAuth, requireRole("admin"), validate(registerSchema), register);
router.get("/me", requireAuth, me);

module.exports = router;
