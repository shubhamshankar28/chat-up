const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
var bodyParser = require('body-parser')
var mongoose = require('mongoose')



var Message = mongoose.model('MessageType' , {
  content:String,
  sender:String,
  senderName:String,
  date:Date,
  messageId:String,
  groupId:String,
});

var Group = mongoose.model('GroupType' , {
  groupId : String
});


var dbUrl = "mongodb+srv://shubham28:shubham28@cluster0.uo1zeww.mongodb.net/?retryWrites=true&w=majority";

const app = express();

app.use(express.json())
// app.use(bodyParser.urlencoded({extended:false}))

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const httpServer = createServer(app);
const io = new Server(httpServer, { cors : {
    origin:["http://localhost:3000","http://localhost:3006","http://localhost:3007" ]
} });


// app.use(express.urlencoded({ extended: true }));

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
    msg['messageId'] = null;
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

  
  console.log('emitting for socket-id : ' + socket.id)
  Message.find({})
  .then((docs) => {
    socket.emit('fetch message history' , docs);
  })
  .catch((err) => {console.log(err)});


  socket.on('disconnect' , (reason) => {
    console.log('disconnect emitted ' + ' by ' + socket.username + ' ' + reason);
    socket.broadcast.emit("user disconnected" , {userID:socket.id,username: socket.username});
  });


  socket.on('group-chat-message' , (msg) => {
    console.log('in group-chat-message listener');
    
    msg['messageId'] = null

    let newMessage = Message(msg)

    for (let [id, socketTemp] of io.of("/").sockets) {

      if(msg.sender === socketTemp.id) {
        console.log(socketTemp.id + ' is joining ' + msg.groupId);
        socketTemp.join(msg.groupId);
      }
  }

    newMessage.save()
    .then(() => {
      console.log('sending message to group : ' + msg.groupId);
      io.to(msg.groupId).emit('receive-group-message ' + msg.groupId , msg);
    })
    .catch((err) => {
      console.log('group chat message failed ' + err)
    })

  })
});

mongoose.connect(dbUrl).catch((err) => {
  console.log("catching the error ......")
  console.log(err)
});


app.get('/groups' , (request,response) => {
  Group.find({})
  .catch((err) => {
    console.log(err);
  })
  .then((groups) => {
    console.log(groups);
    response.send(groups);
  })
})


app.get('/messages/:groupId' , (request,response) => {
  console.log(request.params.groupId);
  Message.find({groupId : request.params.groupId})
  .catch((err) => {
    console.log(err);
  })
  .then((messages) => {
    // console.log(messages);
    response.send(messages);
  })
})

app.post('/groups' , (req, res) => {
    let newGroup = new Group(req.body);
    newGroup.save()
    .then(() => {

    })
    .catch((err) => {
      console.log(err)
    })
    
    console.log(req.body);
})



httpServer.listen(8000);
