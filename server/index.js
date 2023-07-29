const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
var mongoose = require('mongoose')

var Message = mongoose.model('MessageType' , {
  content:String,
  sender:String,
  senderName:String,
  date:Date
});


var dbUrl = "mongodb+srv://shubham28:shubham28@cluster0.uo1zeww.mongodb.net/?retryWrites=true&w=majority";

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
    let newMessage = new Message(msg);
  
    newMessage.save()
    .then(() => {
      io.emit('chat message', msg);
    })
    .catch((err) => {
      console.log("failed to save message");
    })
    // messageHistory.push(msg);
  });

  //notify existing users of a new addition
  socket.broadcast.emit("user connected" ,{userID:socket.id,username: socket.username});


  Message.find({})
  .then((docs) => {
    socket.emit('fetch message history' , docs);
  })
  .catch((err) => {console.log(err)});


  socket.on('disconnect' , (reason) => {
    console.log('disconnect emitted ' + ' by ' + socket.username + ' ' + reason);
    socket.broadcast.emit("user disconnected" , {userID:socket.id,username: socket.username});
  });

});

mongoose.connect(dbUrl).catch((err) => {
  console.log("catching the error ......")
  console.log(err)
})

httpServer.listen(8000);