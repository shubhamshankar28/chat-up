import {User, Message, Group, Admin, Member, MembershipRequest} from './backend/schema.js';
import dataManipulatorFunctions from './backend/dataManipulation.js';


/**
 * 
 * Read discussion about why an async function calling another async function
 * should use await : https://shorturl.at/dtuK0 
 */

function defineMembershipEndpoints(inputOutputObject ,app) {
  let io = inputOutputObject;
app.get('/viewMembershipRequests/:groupId' , async (request, response) => {
    console.log('in /viewMembershipRequest :');
    console.log(request.params);
    const groupId = request.params.groupId;
   
    try {
      const newMembershipRequests = await dataManipulatorFunctions.retrieve(MembershipRequest,{groupId:groupId})
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

    try {
      await dataManipulatorFunctions.deleteMany(MembershipRequest,{username,groupId});
      await dataManipulatorFunctions.create(Member,{username,groupId});
      let remainingMemberships = await dataManipulatorFunctions.retrieve(MembershipRequest,{groupId});
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
    let membership = request.body;
    try {
      let _ = await dataManipulatorFunctions.create(MembershipRequest, membership);
      response.sendStatus(200);
    } 
    catch (err) {
      console.log('error in proposing membership: ');
      console.log(err);
      response.sendStatus(400);
    }
  });
  
  
  app.get('/checkAdminRights/:groupId/:userId' , async (request,response) => {
    console.log('in /checkAdminRights :');
    console.log(request.params.groupId);
    console.log(request.params.userId);
  
    try {
        let doc = await dataManipulatorFunctions.retrieve(Admin, {groupId : request.params.groupId, username: request.params.userId});
        if(doc.length === 0) {
            response.send({'adminStatus' : false});
          }
          else {
            response.send({'adminStatus' : true});
          }
    }
    catch (err) {
        console.log(err);
    }
  });
  
  app.get('/retrieveMembers/:groupId' , async (request,response) => {
    console.log('in /retrieveMembers/' + request.params.groupId);
    try {
      const members = await dataManipulatorFunctions.retrieve(Member, {groupId: request.params.groupId});
      const admins = await dataManipulatorFunctions.retrieve(Admin, {groupId: request.params.groupId});
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

     let _ = await dataManipulatorFunctions.create(Admin , {groupId:request.params.groupId,username:request.params.userId});
  
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
}
export {defineMembershipEndpoints}