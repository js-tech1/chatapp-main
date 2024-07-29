var users = {};

function getUsers(arr) {
  onlineUsers = [];
  if (arr) {
  arr.forEach((onlineUser) => {
    // onlineUsers.push(Object.values(onlineUser)[0]);
    const userName = Object.values(onlineUser)[0];
      // Check if user already exists in onlineUsers
      if (!onlineUsers.includes(userName)) {
        onlineUsers.push(userName);
      }
  });
  } else {
    console.log(`arr is undefined`);
  }
  return onlineUsers;
}

module.exports = { getUsers, users };