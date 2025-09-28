module.exports = function (req, res, next) {
  if (req.session && req.session.authenticated) return next();
  return res.redirect("/login");
};