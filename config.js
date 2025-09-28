module.exports = {
  username: process.env.PANEL_USER || "admin",
  password: process.env.PANEL_PASS || "changeme",
  statsPath: process.env.STATS_URL || process.env.STATS_PATH || "./stats.json",
  sessionSecret: process.env.SESSION_SECRET || "please-change-this",
  pollIntervalMs: Number(process.env.POLL_INTERVAL_MS || 5000),
};