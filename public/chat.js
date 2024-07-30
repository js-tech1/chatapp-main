document.addEventListener('DOMContentLoaded', () => {
  const output = document.getElementById("output");
  const message = document.getElementById("message");
  const send = document.getElementById("send");
  const feedback = document.getElementById("feedback");
  const roomMessage = document.querySelector(".room-message");
  const usersElement = document.querySelector(".users");
  const usersjoin = document.querySelector(".users-join");

  const url = new URL(window.location.href);
  const protocol = url.protocol === 'https:' ? 'wss' : 'ws';
  const socket = io.connect(`${protocol}://${url.host}`);
  // console.log(url
  // );

  fetch("/get-username-roomname")
    .then(response => response.json())
    .then(data => {
      const { username, roomname } = data;
      // console.log("fetch", username, roomname);

      // Initialize chat
      const chat = new Chat(username, roomname);
      chat.initializeChat();

      // Update DOM elements
      roomMessage.innerHTML = `Connected in room ${roomname}`;

      // Emit joined-user event
      socket.emit("joined-user", {
        username: username,
        roomname: roomname,
      });

      // Event listeners
      send.addEventListener("click", () => {
        socket.emit("chat", {
          username: username,
          message: message.value,
          roomname: roomname,
        });
        message.value = "";
      });

      message.addEventListener("keypress", () => {
        socket.emit("typing", { username: username, roomname: roomname });
      });

      socket.on("joined-user", (data) => {
        showJoinPopup(data.username);
      });

      const currentTime = new Date().toLocaleTimeString();
      let messages = JSON.parse(localStorage.getItem(`messages_${roomname}`)) || [];

      messages.forEach((data) => {
        let alignClass = data.username === username ? 'right-align' : 'left-align';
        output.innerHTML +=
          `<p class="${alignClass}"><strong>${data.username}</strong>:<br> ${data.message}</p>`;
      });

      socket.on("chat", (data) => {
        data.message = data.message.replace(/\n/g, '<br>'); // Add this line
        const messageWithTime = `${data.message}<br><br>${currentTime}`;
        let alignClass = data.username === username ? 'right-align' : 'left-align';
        output.innerHTML +=
          `<p class="${alignClass}"><strong>${data.username}</strong>:<br> ${data.message}<br><br>${currentTime}</p>`;

        let messages = JSON.parse(localStorage.getItem(`messages_${roomname}`)) || [];
        messages.push({
          username: data.username,
          message: messageWithTime,
        });
        localStorage.setItem(`messages_${roomname}`, JSON.stringify(messages));
        feedback.innerHTML = "";
        document.querySelector(".chat-message").scrollTop =
          document.querySelector(".chat-message").scrollHeight;
      });

      socket.on("typing", (user) => {
        feedback.innerHTML = "<p><em>" + user + " is typing...</em></p>";
      });

      window.addEventListener('beforeunload', function () {
        socket.emit('online-users');
      });

      socket.on("online-users", (updatedUsers) => {
        usersElement.innerHTML = "";
        updatedUsers.forEach((user) => {
          usersElement.innerHTML += `<p>${user}</p>`;
        });
      });

    })
    .catch(error => console.error("Error fetching username and roomname:", error));

  class Chat {
    constructor(username, roomname) {
      this.username = username;
      this.roomname = roomname;
    }

    initializeChat() {
      // console.log("Initializing chat for", this.username, "in room", this.roomname);
    }
  }

  function showJoinPopup(username) {
    usersjoin.innerHTML = username + " joined the room";

    // Set a timeout to close the alert after 3 seconds
    setTimeout(function () {
      usersjoin.innerHTML = "";
    }, 3000);
  }
});
