const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const {dbUrl} = require("./secretKey.js");
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs');

var User = mongoose.model('UserType' , {
  username : String,
  password : String
});

var Message = mongoose.model('MessageType' , {
  content:String,
  sender:String,
  senderName:String,
  date:Date,
  messageId:String,
  groupId:String,
});

var Group = mongoose.model('GroupType' , {
  groupId : String,
  purpose : String,
  avatar : String
});

var Admin = mongoose.model('AdminType' , {
  groupId : String,
  username: String
});

var Member = mongoose.model('MemberType' , {
  groupId : String,
  username : String
});

var MembershipRequest = mongoose.model('MembershipRequestType' , {
  groupId : String,
  username : String
})


var databaseUrl = dbUrl;
console.log(databaseUrl);


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

  socket.on('disconnect' , (reason) => {
    console.log('disconnect emitted ' + ' by ' + socket.username + ' ' + reason);
    socket.broadcast.emit("user disconnected" , {userID:socket.id,username: socket.username});
  });


  socket.on('join-group' , (groupMetadata) => {
    for (let [id, socketTemp] of io.of("/").sockets) {
      if(groupMetadata.sender === socketTemp.id) {
        console.log(socketTemp.id + ' is joining ' + groupMetadata.groupId);
        socketTemp.join(groupMetadata.groupId);
      }
    }
  });

  socket.on('group-chat-message' , (msg) => {
    console.log('in group-chat-message listener');
    
    msg['messageId'] = null

    let newMessage = Message(msg)

    // for (let [id, socketTemp] of io.of("/").sockets) {
    //   if(msg.sender === socketTemp.id) {
    //     console.log(socketTemp.id + ' is joining ' + msg.groupId);
    //     socketTemp.join(msg.groupId);
    //   }
    // }

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

mongoose.connect(databaseUrl).catch((err) => {
  console.log("catching the error ......")
  console.log(err)
});


app.get('/groups' , (request,response) => {
  Group.find({})
  .catch((err) => {
    console.log(err);
  })
  .then((groups) => {
    // console.log(groups);
    response.send(groups);
  })
})


app.get('/viewMembershipRequests/:groupId' , async (request, response) => {
  console.log('in /viewMembershipRequest :');
  console.log(request.params);
  const groupId = request.params.groupId;
 
  try {
    const newMembershipRequests = await MembershipRequest.find({groupId: groupId});
    return response.send(newMembershipRequests);
  }
  catch (error) {
    console.log('error in /viewMembership:');
    console.log(error); 
    return response.send([]);
  }
});


app.get('/grantMembership/:groupId/:userId' , async (request, response) => {
  console.log('in /grantMembership :');
  console.log(request.params.groupId);
  console.log(request.params.userId);

  for (let [id, socketTemp] of io.of("/").sockets) {
    console.log(socketTemp.username);
    if(request.params.userId === socketTemp.username) {
      console.log('socket defined for : ' + socketTemp.id + ' : ' + socketTemp.username);
      socketTemp.emit('membership-approved' , true);
    }
  }
  
  const username = request.params.userId;
  const groupId = request.params.groupId;

  const newMember = Member({username,groupId});
  try {
    await MembershipRequest.deleteMany({username,groupId});
    await newMember.save();
    let remainingMemberships = await MembershipRequest.find({groupId});
    response.send(remainingMemberships);
  }
  catch (error) {
    console.log('error in /grantMembership:');
    console.log(error);
    response.send([]);
  }
});



app.post('/proposeMembership', async (request,response) => {
  console.log('proposing membership :');
  const membership = request.body;
  console.log(membership);
  const newMembershipRequest = MembershipRequest(membership);
  try {
    let result = await newMembershipRequest.save();
    response.sendStatus(200);
  } 
  catch (err) {
    console.log('error in proposing membership: ');
    console.log(err);
    response.sendStatus(400);
  }
});


app.get('/checkAdminRights/:groupId/:userId' , (request,response) => {
  console.log('in /checkAdminRights :');
  console.log(request.params.groupId);
  console.log(request.params.userId);

  Admin.find({groupId : request.params.groupId, username: request.params.userId})
  .catch((err) => {
    console.log(err);
  })
  .then((doc) => {
    if(doc.length === 0) {
      response.send({'adminStatus' : false});
    }
    else {
      response.send({'adminStatus' : true});
    }
  });
});

app.get('/retrieveMembers/:groupId' , async (request,response) => {
  console.log('in /retrieveMembers/' + request.params.groupId);
  try {
    const members = await Member.find({groupId: request.params.groupId});
    const admins = await Admin.find({groupId: request.params.groupId});
    const finalMembers = members.filter((obj) => {
      for(let i=0; i<admins.length; ++i) {
        let admin = admins[i];
        console.log(admin.username);
        console.log(obj.username);
        if(obj.username === admin.username)
          return false;
      }
      return true;
    })
    response.send(finalMembers);
  }
  catch (error) {
    console.log('encountered error :');
    console.log(error);
    response.send([]);
  }
});

app.post('/grantAdminRights/:groupId/:userId' , async (request,response) => {
  console.log('in /grantAdminRights');
  console.log(request.params.groupId);
  console.log(request.params.userId);

  try {
    const newAdmin = Admin({groupId:request.params.groupId,username:request.params.userId});
    await newAdmin.save();

    for (let [id, socketTemp] of io.of("/").sockets) {
      if(request.params.userId === socketTemp.username) {
        console.log('socket defined for : ' + socketTemp.id + ' : ' + socketTemp.username);
        socketTemp.emit('admin-status-granted' , true);
      }
    }

    response.sendStatus(200);
  }
  catch (error) {
    console.log('encountered error :');
    console.log(error);
    response.sendStatus(400);
  }

});

app.get('/messages/:groupId/:userId' , (request,response) => {
  console.log('in /messages :');
  console.log(request.params.groupId);
  console.log(request.params.userId);

  Member.find({groupId : request.params.groupId, username: request.params.userId})
  .catch((err) => {
    console.log(err);
  })
  .then((doc) => {
    if(doc.length === 0) {
      response.send({'status' : 'user is not a member of group'});
    }

    else {
      Message.find({groupId : request.params.groupId})
      .catch((err) => {
        console.log(err);
      })
      .then((messages) => {
        // console.log(messages);
        response.send(messages);
      });
    }
  });
});

app.post('/signup' ,  (req, res) => {
  const credentials = req.body;

  console.log(credentials);
  bcrypt.genSalt(10 , (err, salt) => {
    if(err) {
      console.log('error in generating salt: ' + err);
      return;
    }

    bcrypt.hash(credentials.password, salt, null, (error, hashedPassword) => {
      
      if(error) {
        console.log('error in generating hash: ' + error);
        return;
      }

      const finalCredentials = {'username' : credentials.username, 'password' : hashedPassword};
      var newPassword = User(finalCredentials);
      newPassword.save()
      .catch((err) => {
        console.log(err)
      })
      .then(() => {
        res.sendStatus(200)
      });
    });
  })
});


app.post('/login' , (req,res) => {
  console.log('login called');
  const credentials = req.body;
  console.log(credentials);
  const curUsername = credentials.username;

  User.findOne({username : curUsername})
  .then((user) => {
    if(user === null) {
      console.log('user not found');
      res.sendStatus(400);
    }
    else {
       console.log('printing user details');
       console.log(user);
       const curPassword = user['password'];
       bcrypt.compare(credentials.password, curPassword, (err, result) => {
        if(err) {
          console.log('encountered error : ' + err + ' while comparing password');
          res.sendStatus(400);
        }
        else {
          res.status(200).send({token : credentials.username});
        }
       });
    }
  }).catch((err) => {
    console.log('error while finding user : ' + err);
  })

});

app.post('/groups' , async (req, res) => {
    console.log(req.body);

  try {
      let currentGroups = await Group.find({groupId : req.body.groupId});

      if(currentGroups.length > 0) {
        res.status(400).send('group already exists');
      }

      else {
        let newGroup = new Group(req.body);
        let outcome = await newGroup.save();
        const ids = await io.of("/").allSockets();

        for (let [id, socketTemp] of io.of("/").sockets) {
            console.log('socket defined for : ' + socketTemp.id + ' : ' + socketTemp.username);
        }

        console.log('emitting new group added');
        io.emit('new-group-added' , req.body);
        res.sendStatus(200);
      }
  }
  catch (error) {
    res.sendStatus(400);
    console.log(err);
  }
});

httpServer.listen(8000, () => {

});



