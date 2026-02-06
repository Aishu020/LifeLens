const express = require("express");
const bcrypt = require("bcryptjs");
const { signToken } = require("../utils/auth");
const { isEmail, requireFields } = require("../utils/validators");
const { createUser, findUserByEmail } = require("../services/userService");

const router = express.Router();

router.post("/signup", (req, res) => {
  const missing = requireFields(req.body, ["email", "password", "name"]);
  if (missing.length) return res.status(400).json({ error: "Missing fields", missing });
  if (!isEmail(req.body.email)) return res.status(400).json({ error: "Invalid email" });

  const existing = findUserByEmail(req.body.email);
  if (existing) return res.status(409).json({ error: "Email already registered" });

  const user = createUser(req.body);
  const token = signToken({ id: user.id, email: user.email });
  return res.json({ user, token });
});

router.post("/login", (req, res) => {
  const missing = requireFields(req.body, ["email", "password"]);
  if (missing.length) return res.status(400).json({ error: "Missing fields", missing });

  const user = findUserByEmail(req.body.email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const matches = bcrypt.compareSync(req.body.password, user.password_hash);
  if (!matches) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken({ id: user.id, email: user.email });
  return res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
});

module.exports = router;

