const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const config = require("./config");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
  })
);

// Routes
app.use("/", require("./routes/auth"));
app.use("/", require("./routes/dashboard")(io));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`✅ Panel running on port ${PORT}`));