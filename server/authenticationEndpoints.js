import bcrypt from 'bcrypt-nodejs';
import {User, Message, Group, Admin, Member, MembershipRequest} from './backend/schema.js';

function defineAuthenticationEndpoints(app) {
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
  
        User.find({'username':credentials.username}).then((doc) => {
          if(doc.length === 0) {
            const finalCredentials = {'username' : credentials.username, 'password' : hashedPassword};
            var newPassword = User(finalCredentials);
            newPassword.save()
            .catch((err) => {
              console.log(err)
              res.sendStatus(500);
            })
            .then(() => {
              res.sendStatus(200)
            });
          }
          else {
            res.sendStatus(500);
          }
        }).catch((err) => {
          res.sendStatus(500);
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
        res.status(400).send({'status':'user not found'});
      }
      else {
         console.log('printing user details');
         console.log(user);
         const curPassword = user['password'];
         bcrypt.compare(credentials.password, curPassword, (err, result) => {
          if(err || (result === false)) {
            console.log('encountered error : ' + err + ' while comparing password');
            res.status(400).send({'status':'authentication failed'});
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
}

export {defineAuthenticationEndpoints}