import mongoose from 'mongoose';

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

export {User, Message, Group, Admin, Member, MembershipRequest};
  