const express = require("express");
const fs = require("fs");
const path = require("path");
const fetch = (...args) => import("node-fetch").then(({ default: fn }) => fn(...args));
const { requireAuth } = require("./auth");
const config = require("../config");

module.exports = function (io) {
  const router = express.Router();

  router.get("/dashboard", requireAuth, (req, res) => res.render("dashboard"));

  router.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const stats = await readStats();
      return res.json({ ok: true, stats });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  });

  async function readStats() {
    if (/^https?:\/\//i.test(config.statsPath)) {
      const r = await fetch(config.statsPath);
      if (!r.ok) throw new Error("Failed to fetch stats from URL");
      return r.json();
    }
    const p = path.resolve(config.statsPath);
    if (!fs.existsSync(p)) throw new Error("stats.json not found at: " + p);
    return JSON.parse(fs.readFileSync(p, "utf8"));
  }

  return router;
};