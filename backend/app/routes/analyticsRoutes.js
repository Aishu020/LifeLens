const express = require("express");
const { authMiddleware } = require("../utils/auth");
const {
  getMoodTrend,
  getMoodDistribution,
  getHeatmap,
  getStreak,
} = require("../services/analyticsService");

const router = express.Router();
router.use(authMiddleware);

router.get("/overview", (req, res) => {
  const moodTrend = getMoodTrend(req.user.id);
  const moodDistribution = getMoodDistribution(req.user.id);
  const heatmap = getHeatmap(req.user.id);
  const streak = getStreak(req.user.id);

  res.json({ moodTrend, moodDistribution, heatmap, streak });
});

module.exports = router;

