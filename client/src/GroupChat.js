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

  try {
    let response =  await fetch('http://localhost:8000/messages/' + params.groupId, {
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

  
    let groupChatRaw = await response.json();
    let groupChatList = groupChatRaw.map((msg) => {
      return {
        position:((socket.id === msg.sender) ? "right" : "left"),
        type:"text",
        text:msg.content,
        title:msg.senderName,
        date:msg.date
      }
    });


    return {groupChatList, groupId};
    }
    catch(err) {
      console.log(err);
      let groupChatList = [];
      return {groupChatList, groupId};
    }
}

function GroupChat(props) {

  const {groupChatList, groupId} = useLoaderData();

  const location = useLocation();
  const state=location.state;

  const [messageList, setMessageList] = useState(amend(groupChatList));
  const [message, setMessage] = useState('');

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
        console.log(state);
        console.log(state['formValue']);
        if(state === null) {
          console.log(state['formValue']);
          navigate('/user');
        }

        const userName = sessionStorage.getItem('token');
        if(userName === null) {
          navigate('/user');
        }

        console.log(state['formValue']);
        console.log(state);

        socket.auth = {username:state['formValue']};
        socket.connect();
      

        console.log('connecting with username '+ socket.auth.username);

        socket.on("connect_error", (err) => {
          if (err.message === "invalid username") {
            this.usernameAlreadySelected = false;
          }
        });

        socket.on("disconnect" , (reason) => {
            console.log(reason);
        });

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
            console.log('group chat component is being unmounted');
            socket.removeListener('receive-group-message ' + groupId);
          }
    }, []);

    const clickMessageHandler = (msg) => {
        console.log(socket._callbacks_);
        console.log('logging: active listeners in click message handle');
        console.log(socket.listeners('receive-group-message ' + groupId));
        console.log('sending message to ' + groupId);
        socket.emit('group-chat-message' , {content:message , sender:socket.id , senderName:state['formValue'] , date:new Date(), groupId: groupId}); 
        setMessage('');
      };

    const changeMessageHandler = (e) => {
    setMessage(e.target.value);
    };


  return (
    <div className="GroupChat">

        <MyNavBar state={{formValue:state?.formValue}}></MyNavBar>
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="h3" gutterBottom>
            Welcome to {groupId}
          </Typography>
        </div>
        

        <div className="groupChatMessage">
          <MessageList
              className="messageList"
              lockable={true}
              toBottomHeight={"100%"}
              dataSource={messageList}
          />
          <br/>
        </div>

        <br/>
        <br/>

        
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
    </div>
  );
}

export default GroupChat;
