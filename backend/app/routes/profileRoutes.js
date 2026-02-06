const express = require("express");
const { authMiddleware } = require("../utils/auth");
const { getProfile } = require("../services/profileService");

const router = express.Router();
router.use(authMiddleware);

router.get("/", (req, res) => {
  res.json(getProfile(req.user.id));
});

module.exports = router;

