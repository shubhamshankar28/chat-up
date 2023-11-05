import {User, Message, Group, Admin, Member, MembershipRequest} from './backend/schema.js';
import dataManipulatorFunctions from './backend/dataManipulation.js';

function defineChatEndpoints(inputOutputObject, app) {
  let io = inputOutputObject;
app.get('/groups' , async (request,response) => {
    try {
        let groups = await dataManipulatorFunctions.retrieve(Group, {});
        response.send(groups);
    }
    catch (err) {
        console.log(err);
    }
});


app.get('/users/:groupId/:userId' , async (request,response) => {
  console.log('in /users :');
  console.log(request.params.groupId);
  console.log(request.params.userId);


  try {
      let doc = await dataManipulatorFunctions.retrieve(Member, {groupId : request.params.groupId, username: request.params.userId});
      if(doc.length === 0) {
          response.send({'status' : 'user is not a member of group'});
      }
      else {
        const sockets = await io.in(request.params.groupId).fetchSockets();
        console.log('sockets connected to ' + request.params.groupId + ' ' + sockets.length);
        let userList = sockets.map((socket) => socket.username);
        console.log(userList);
        response.send(userList);
      }
  }
  catch (err) {
      console.log(err);
  }
});


  app.get('/messages/:groupId/:userId' , async (request,response) => {
    console.log('in /messages :');
    console.log(request.params.groupId);
    console.log(request.params.userId);
  

    try {
        let doc = await dataManipulatorFunctions.retrieve(Member, {groupId : request.params.groupId, username: request.params.userId});
        if(doc.length === 0) {
            response.send({'status' : 'user is not a member of group'});
        }
        else {
            let messages = await dataManipulatorFunctions.retrieve(Message, {groupId : request.params.groupId});
            response.send(messages);
        }
    }
    catch (err) {
        console.log(err);
    }
  });

  app.post('/groups' , async (req, res) => {
    console.log(req.body);

  try {
      let currentGroups = await dataManipulatorFunctions.retrieve(Group, {groupId : req.body.groupId})

      if(currentGroups.length > 0) {
        res.status(400).send('group already exists');
      }

      else {
        let _ = await dataManipulatorFunctions.create(Group, req.body);
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
    console.log(error);
  }
});
}

export {defineChatEndpoints};