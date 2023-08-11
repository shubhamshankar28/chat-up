import './App.css';
import {useState, useEffect} from 'react';
import socket from './socket.js';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useLoaderData, useLocation, useNavigate } from 'react-router-dom';

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
  // console.log(groupChatList);
  // console.log(groupId);

  const [messageList, setMessageList] = useState(groupChatList);
  const [message, setMessage] = useState('');
  const location = useLocation();
  const state=location.state;

  const navigate = useNavigate();
  console.log(state);

  
  if(state === null) {

    navigate('/user');
  }

  useEffect(() => {
        console.log(state);
        if(state === null) {
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
              position:((socket.id === msg.sender) ? "right" : "left"),
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

    const clickMessageHandler = (e) => {
        console.log(socket._callbacks_);
        console.log('logging: active listeners in click message handle');
        console.log(socket.listeners('receive-group-message ' + groupId));
        console.log('sending message to ' + groupId);
        socket.emit('group-chat-message' , {content:message , sender:socket.id , senderName:props.userName , date:new Date(), groupId: groupId}); 
        setMessage('');
      };

    const changeNameHandler = (e) => {
    // console.log('logging: active listeners in change name handler');
    // console.log(socket.listeners('receive-group-message ' + groupId));
    setMessage(e.target.value);
    };

  return (
    <div className="GroupChat">
        <ol>
            {messageList.map((obj, index) => <li key={index}> Message 1  {obj.text} </li>)}
        </ol>

        <div className="messageBox">
              <h1> This is {groupId} group!</h1>
              <Stack direction="row" spacing={2}>
                <div className="messageField">
                  <TextField
                  id="outlined-textarea"
                  value={message}
                  onChange={changeNameHandler}
                  multiline
                  fullWidth
                  />
                </div>
                <Button variant="contained" onClick = {clickMessageHandler}>Enter</Button>
              </Stack>
            </div>
    </div>
  );
}

export default GroupChat;
