import {Message} from './backend/schema.js';
import dataManipulatorFunctions from './backend/dataManipulation.js';

function defineSocketLogic(io) {
    io.use((socket, next) => {
        const username = socket.handshake.auth.username;
        if (!username) {
          return next(new Error("invalid username"));
        }
        socket.username = username;
        next();
      });
      
      io.on("connection", (socket) => {
        console.log(socket.id);
      
        socket.on("disconnecting" , (reason) => {
          console.log(socket.username + ' is going to disconnect ' + reason);
          let room = socket.rooms;
          room.forEach(element => {
            io.to(element).emit('user-removed ' + element, {groupId:element, credential:socket.username});
          });
          console.log(room);
        })

        socket.on('disconnect' , (reason) => {
          console.log('disconnect emitted ' + ' by ' + socket.username + ' ' + reason);
          let room = socket.rooms;
          console.log(room);
          socket.broadcast.emit("user disconnected" , {userID:socket.id,username: socket.username});
        });
      
      
        socket.on('join-group' , (groupMetadata) => {
          console.log('in join group for ' + groupMetadata.credential);
          for (let [id, socketTemp] of io.of("/").sockets) {
            if(groupMetadata.sender === socketTemp.id) {
              console.log(socketTemp.id + ' is joining ' + groupMetadata.groupId);
              socketTemp.join(groupMetadata.groupId);
            }
          }
          io.to(groupMetadata.groupId).emit('new-user-added '+groupMetadata.groupId, {username:groupMetadata.credential,groupId:groupMetadata.groupId});
        });
      
        socket.on('group-chat-message' , async (msg) => {
          console.log('in group-chat-message listener');
          
          msg['messageId'] = null
      
          try {
            await dataManipulatorFunctions.create(Message,msg);
            console.log('sending message to group : ' + msg.groupId);
            io.to(msg.groupId).emit('receive-group-message ' + msg.groupId , msg);
          }
          catch (err) {
            console.log('group chat message failed ' + err);
          }
        });
      });
}

export {defineSocketLogic};