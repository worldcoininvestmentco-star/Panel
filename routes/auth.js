const express = require("express");
const router = express.Router();
const config = require("../config");

function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) return next();
  return res.redirect("/login");
}
module.exports.requireAuth = requireAuth;

router.get("/login", (req, res) => res.render("login", { error: null }));
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === config.username && password === config.password) {
    req.session.authenticated = true;
    return res.redirect("/dashboard");
  }
  res.render("login", { error: "Invalid credentials" });
});
router.get("/logout", (req, res) =>
  req.session.destroy(() => res.redirect("/login"))
);

module.exports = router;