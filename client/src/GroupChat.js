import './App.css';
import {useState, useEffect} from 'react';
import socket from './socket.js';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useLoaderData, useLocation, useNavigate } from 'react-router-dom';
import { MessageList } from 'react-chat-elements';
import MyNavBar from './CustomNavbar';
import { Container } from '@mui/material';

export async function groupChatLoader({params}) {
  
  
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


    console.log(groupChatRaw);
    console.log(adminStatusRaw);
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

    return {groupChatList, groupId, status : '200', adminStatus:adminStatusRaw['adminStatus']};
    }
    catch(err) {
      console.log(err);
      let groupChatList = [];
      return {groupChatList, groupId , status : '200', adminStatus:false};
    }
}

function GroupChat(props) {

  const {groupChatList, groupId,status, adminStatus} = useLoaderData();

  console.log(adminStatus)
  const location = useLocation();
  const state=location.state;

  const [messageList, setMessageList] = useState(amend(groupChatList));
  const [message, setMessage] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [currentAdminStatus, setCurrentAdminStatus] = useState(adminStatus);

  const navigate = useNavigate();

  console.log(state);

  function amend(groupChatList) {
    return [].concat(groupChatList.map((msg) => {
      let newMessage = msg;
      newMessage['position'] = ((msg['title'] === state['formValue']) ? "right" : "left");
      return newMessage;
    }));
  }

  
  if(state === null) {

    navigate('/user');
  }
  
  useEffect(() => {

    const d = new Date();
    console.log(d + ': mounting group-chat component');

        if(status === '400') {
          setIsMember(false);
          return;
        }
        setIsMember(true);
        console.log(state);
        console.log(state['formValue']);
        if(state === null) {
          console.log(state['formValue']);
          navigate('/user');
        }

        let userName = sessionStorage.getItem('token');
        if(userName === null) {
          navigate('/user');
        }


        console.log(state['formValue']);
        console.log(state);


        if(!socket.connected) {
          socket.auth = {username:userName};
          socket.connect();
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
        socket.emit('join-group', {groupId, sender:socket.id});

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
        }
        });
        console.log('logging : all event listeners');
        console.log(socket.listeners('receive-group-message ' + groupId));


        return () => {
          const d = new Date();
          console.log(d + ': unmounting group-chat component');
            socket.removeListener('receive-group-message ' + groupId);
            socket.removeAllListeners('disconnect');
            socket.removeAllListeners('membership-approved');
            socket.removeAllListeners('admin-status-granted');
            socket.removeAllListeners('connect_error');
          }
    }, []);

    const clickMessageHandler = (msg) => {
      socket.emit('join-group', {groupId, sender:socket.id});
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
    <div className="GroupChat">

        <MyNavBar state={{formValue:state?.formValue, isAdmin:currentAdminStatus, groupId}}></MyNavBar>
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="h3" gutterBottom>
            {groupId}
          </Typography>
        </div>
        
        <br/>
        <br/>

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

        {isMember && <div className="groupChatMessage">
          <MessageList
              className="messageList"
              lockable={true}
              toBottomHeight={"100%"}
              dataSource={messageList}
          />
          <br/>
        </div> }

        {isMember && <br/>}
        {isMember && <br/>}

        
        {isMember && <Container maxWidth="sm">
            <Stack direction="row" spacing={2}>
                    <TextField id="outlined-basic" 
                    label="Enter message" 
                    value={message} 
                    onChange = {changeMessageHandler} 
                    fullWidth />
                    <Button variant="contained" onClick = {clickMessageHandler}>Enter</Button>
            </Stack>
      </Container>
        } 
    </div>
  );
}

export default GroupChat;
