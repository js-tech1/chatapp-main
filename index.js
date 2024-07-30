const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
const socketIo = require("socket.io");
const crypto = require('crypto');
const path = require('path');

const app = express();
const server = require("http").createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));
app.set('views', path.join(__dirname, '../views'));
app.set("view engine", "ejs");

const secretKey = crypto.randomBytes(32).toString('hex');
app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: true,
}));

app.get("/", (req, res) => {
  res.render("index");
});

app.post('/room', (req, res) => {
  const { username, roomname } = req.body;
  req.session.username = username + Math.floor(Math.random() * 10000);
  req.session.roomname = roomname;
  res.redirect('/room');
});

app.get("/get-username-roomname", (req, res) => {
  const { username, roomname } = req.session;
  res.json({ username, roomname });
});

app.get('/room', (req, res) => {
  const { username, roomname } = req.session;
  res.render('room', { username, roomname });
});

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

require("../utils/socket")(io);

module.exports = app;
module.exports = server;
