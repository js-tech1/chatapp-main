const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
const socket = require("socket.io");
const crypto = require('crypto');
const path = require('path');
const cors = require('cors');


const app = express();



app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));

var port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.render("index");
});
const secretKey = crypto.randomBytes(32).toString('hex');
app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: true,
}));


const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server Running on 3000`);
});
app.use(cors());
const io = socket(server, { // Initialize socket.io with the server
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  http: true,
});
require("./utils/socket")(io);

// app.post("/room", (req, res) => {
//   roomname = req.body.roomname;
//   username = req.body.username;
//   const uniqueIdentifier = Math.floor(Math.random() * 10000);
//   res.redirect(`/room?username=${username+uniqueIdentifier}&roomname=${roomname}`);
// });
app.post('/room', (req, res) => {
  const { username, roomname } = req.body;

  // Store the username and roomname in the session
  req.session.username = username + Math.floor(Math.random() * 10000);
  req.session.roomname = roomname;

  // Redirect to the room without exposing parameters in the URL
  res.redirect('/room');
});
app.get("/get-username-roomname", (req, res) => {
  const { username, roomname } = req.session;
  console.log("get", username); // Assuming you stored them in the session
  res.json({ username, roomname });
});
app.get('/room', (req, res) => {
  // Access the stored username and roomname from the session
  const { username, roomname } = req.session;
  console.log(username, roomname);
  // Render your room template with the username and roomname
  res.render('room', { username, roomname });
});



