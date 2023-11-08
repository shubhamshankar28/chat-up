import './App.css';
import {useState, useEffect, useRef} from 'react';
import socket from './socket.js';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useLoaderData, useLocation, useNavigate } from 'react-router-dom';
import { MessageList } from 'react-chat-elements';
import { ChatItem } from 'react-chat-elements';
import MyNavBar from './CustomNavbar';
import { Container, Grid } from '@mui/material';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import "./groupChatStyles.css";


async function retrieveUsers(groupId, userName) {
  let users = await fetch('http://localhost:8000/users/' + groupId + '/' + userName, {
    method: "GET",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
  let usersList = await users.json();


  console.log(usersList);

  if('status' in usersList) {
    return null;
  }

  if(!usersList?.includes(userName)) {
    usersList.push(userName);
  }
  console.log(usersList);

  return usersList;
}

export async function groupChatLoader({params}) {
  
  console.log('group chat loader has been triggered');
  let groupId = params.groupId;
  console.log(groupId);

  const userName = sessionStorage.getItem('token');
  if((userName === null)) {
    return;
  }

  try {
    let response =  await fetch('http://localhost:8000/messages/' + params.groupId + '/' + userName, {
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    let adminStatus = await fetch('http://localhost:8000/checkAdminRights/' + params.groupId + '/' + userName, {
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });


  
    
    let groupChatRaw = await response.json();
    let adminStatusRaw = await adminStatus.json();
    let usersList = await retrieveUsers(params.groupId, userName);

    console.log('loading raw group chat');
    console.log(groupChatRaw);
    console.log('loading admins status');
    console.log(adminStatusRaw);
    console.log('loading users ');
    console.log(usersList);

    if(('status' in groupChatRaw) && (groupChatRaw['status'] === 'user is not a member of group')) {
      return {groupChatList : [] , groupId, status : '400', adminStatusRaw}
    }

    let groupChatList = groupChatRaw.map((msg) => {
      return {
        position:((socket.id === msg.sender) ? "right" : "left"),
        type:"text",
        text:msg.content,
        title:msg.senderName,
        date:msg.date
      }
    });

    return {groupChatList, groupId, status : '200', adminStatus:adminStatusRaw['adminStatus'], usersList};
    }
    catch(err) {
      console.log(err);
      let groupChatList = [];
      return {groupChatList, groupId , status : '200', adminStatus:false};
    }
}


function GroupChat(props) {

  const {groupChatList, groupId,status, adminStatus, usersList} = useLoaderData();

  const location = useLocation();
  const state=location.state;

  const [messageList, setMessageList] = useState(amend(groupChatList));
  const [userList, setUserList] = useState(usersList);
  const [message, setMessage] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [currentAdminStatus, setCurrentAdminStatus] = useState(adminStatus);
  const [mounted, setMounted] = useState(true);

  const navigate = useNavigate();
  const messagesEndRef = useRef(null)

  const scrollBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }
 
  function amend(groupChatList) {
    return [].concat(groupChatList.map((msg) => {
      let newMessage = msg;
      newMessage['position'] = ((msg['title'] === state['formValue']) ? "right" : "left");
      return newMessage;
    }));
  }


  
  useEffect(() => {

    const d = new Date();
    console.log('-------');
    console.log(d + ': mounting group-chat component');
    console.log('------');

        if(status === '400') {
          console.log('current user is not a member');
          setIsMember(false);
          return;
        }
        setIsMember(true);

        let userName = sessionStorage.getItem('token');
        if(userName === null) {
          navigate('/user');
        }


        if(!socket.connected) {
          socket.auth = {username:userName};
          console.log('connecting with username '+ socket.auth.username);
        }

        socket.on("connect_error", (err) => {
          if (err.message === "invalid username") {
            this.usernameAlreadySelected = false;
          }
        });

        socket.on("membership-approved" , (_) => {
          setIsMember(true);
        });

        socket.on("admin-status-granted" , (_) => {
          setCurrentAdminStatus(true);
        })

        socket.on("disconnect" , (reason) => {
            console.log("socket connection has been disconnected on the client side");
        });

        socket.emit('join-group', {groupId, sender:socket.id, credential:userName});


        socket.on('receive-group-message ' + groupId , (msg) => {
            console.log('in receive group message ' + groupId + ' ' + msg.groupId);

            if(groupId ===  msg.groupId) {
            console.log('in receive-group-message '  + groupId);
            const message = {
              position:((state['formValue'] === msg.senderName) ? "right" : "left"),
              type:"text",
              text:msg.content,
              title:msg.senderName,
              date:msg.date
            };
            // console.log(messageList);
            setMessageList(list => [...list, message]);
            console.log('scrolling to the bottom');
            scrollBottom();
        }
        });

        socket.on('new-user-added ' + groupId , (msg) => {
          if(msg.username === undefined) {
            return;
          }
          console.log('new-user-added ' + groupId + ' ' + msg.username);

          if(groupId ===  msg.groupId) {
          console.log('in new-user-added '  + groupId);
          // console.log(messageList);
        
          
         
          setUserList(list => {

            if(!list?.includes(msg.username))
            return [...list, msg.username]
          else
            return list;
          });
      }
      });

      socket.on('user-removed '+ groupId , (msg) => {
        if(msg.groupId === groupId) {
          console.log(msg.credential + ' is leaving ' + msg.groupId);
          setUserList(list => {
            let newList = [].concat(list.filter((element) => {
              return (element !== msg.credential);
            }));
            return newList;
          });
        }
      });


        console.log('logging : all event listeners');
        console.log(socket.listeners('receive-group-message ' + groupId));

        retrieveUsers(groupId, userName).then((connectedUserList) => {
          scrollBottom();
          setUserList(connectedUserList);
          
        });
        
        console.log('scrolling to the bottom at mount');
        

        return () => {
          const d = new Date();
          console.log('-------');
          console.log(d + ': unmounting group-chat component');
          console.log('------');
            socket.removeListener('receive-group-message ' + groupId);
            socket.removeAllListeners('disconnect');
            socket.removeAllListeners('membership-approved');
            socket.removeAllListeners('admin-status-granted');
            socket.removeAllListeners('connect_error');
            socket.removeAllListeners('new-user-added ' + groupId);
          }
    }, []);

    const clickMessageHandler = (msg) => {
      let userName = sessionStorage.getItem('token');
      socket.emit('join-group', {groupId, sender:socket.id, credential:userName});
      // socket.emit('join-group', {groupId, sender:socket.id});
        console.log(socket._callbacks_);
        console.log('logging: active listeners in click message handle');
        console.log(socket.listeners('receive-group-message ' + groupId));
        console.log('sending message to ' + groupId);
        socket.emit('group-chat-message' , {content:message , sender:socket.id , senderName:state['formValue'] , date:new Date(), groupId: groupId}); 
        setMessage('');
      };

    const clickMembershipHandler = async () => {
      let userName = sessionStorage.getItem('token');
      console.log('proposing membership');
      console.log(userName);
      console.log(groupId);
      let result = await fetch('http://localhost:8000/proposeMembership', {
        method: "POST",
        body: JSON.stringify({"username" : userName , "groupId" : groupId}),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      console.log('fetch status is : ');
      console.log(result);
      
      navigate('/view-group' , {state:{formValue:userName}});
    };

    const changeMessageHandler = (e) => {
    setMessage(e.target.value);
    };


  return (
    <div>
        <MyNavBar state={{formValue:state?.formValue, isAdmin:currentAdminStatus, groupId}}></MyNavBar>
        
        {!isMember && 
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="h3" gutterBottom>
            {groupId}
          </Typography>
          <br/>
        <br/>
        </div>
        }

        {!isMember && 
            <div className="userNotFound">
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h4" gutterBottom>
                  You are not a member of {groupId}
                </Typography>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Button variant="contained" onClick = {clickMembershipHandler}>Propose Membership</Button>
              </div>
            </div>
        }

        {isMember && 
        <Grid container spacing={2}>
        <Grid item xs={2}>
          <br/>
        <Typography variant="h4">
            Active Users
            </Typography>
        </Grid>

<Grid item xs={10}>
  <br/>
<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="h3" gutterBottom>
            {groupId}
          </Typography>
        </div>
</Grid>

          <Grid item xs={2}>
          {
            userList?.map((username,index) => {
              return <><Card key={index} variant='outlined' sx={{marginBottom:1,marginLeft:1,marginRight:1}}>
                <CardContent>
                  <Typography sx={{fontSize:14}} color="text.primary">
                    {username}
                  </Typography>
                </CardContent>
              </Card>
              </>
            })
          }
        </Grid>

        <Grid item xs={10}>
          <div className='messagesWrapper'>
          <MessageList
                className="messageList"
                lockable={true}
                toBottomHeight={"100%"}
                dataSource={messageList}
            />
            <br/>
            <br/>
            <br/>
            
            <div ref={messagesEndRef} />
            </div>
            <Container maxWidth="sm">
              <Stack direction="row" spacing={2}>
                      <TextField id="outlined-basic" 
                      label="Enter message" 
                      value={message} 
                      onChange = {changeMessageHandler} 
                      fullWidth />
                      <Button variant="contained" onClick = {clickMessageHandler}>Enter</Button>
              </Stack>
        </Container>

        </Grid>
        </Grid>}
    </div>
  );
}

export default GroupChat;
