const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors : {
    origin:["http://localhost:3000","http://localhost:3006","http://localhost:3007" ]
} });

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.username = username;
  next();
});

const messageHistory = []

io.on("connection", (socket) => {
  console.log(socket.id);

  
    //emit all users
    const users = [];
    for (let [id, socket] of io.of("/").sockets) {
      users.push({
        userID: id,
        username: socket.username,
      });
    }
    socket.emit("retrieve userlist",users);

  //emit a chat message to all users
  socket.on('chat message' , (msg) => {
    io.emit('chat message', msg);
    messageHistory.push(msg);
  });

  //notify existing users of a new addition
  socket.broadcast.emit("user connected" ,{userID:socket.id,username: socket.username});


  socket.emit('fetch message history' , messageHistory);

  socket.on('disconnect' , (reason) => {
    console.log('disconnect emitted ' + ' by ' + socket.username + ' ' + reason);
    socket.broadcast.emit("user disconnected" , {userID:socket.id,username: socket.username});
  });

});

httpServer.listen(8000);