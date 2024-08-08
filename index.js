const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
const socket = require("socket.io");
const crypto = require('crypto');
const path = require('path');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());



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
const io = socket(server);
require("./utils/socket")(io);


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
  // console.log("get", username); // Assuming you stored them in the session
  res.json({ username, roomname });
});
app.get('/room', (req, res) => {
  // Access the stored username and roomname from the session
  const { username, roomname } = req.session;
  // console.log(username, roomname);
  // Render your room template with the username and roomname
  res.render('room', { username, roomname });
});


const sendKeepAliveRequest = async () => {
  try {
    const response = await axios.get(`https://chatapp-main.onrender.com`);
    console.log(`Keep-alive request sent. Status: ${response.status}`);
  } catch (error) {
    console.error('Error sending keep-alive request:', error);
  }
};

// Send keep-alive request every 30 seconds
setInterval(sendKeepAliveRequest, 30 * 1000);

// Immediately send the first request
sendKeepAliveRequest();
