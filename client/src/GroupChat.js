import './App.css';
import {useState, useEffect} from 'react';
import socket from './socket.js';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

function GroupChat(props) {

  const [messageList, setMessageList] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {

        console.log('group chat component is being mounted');

        fetch('http://localhost:8000/messages/' + props.groupId, {
            method: "GET",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          })
          .then((res) => {
              return res.json();
          })
          .then((elem) => {
              console.log(elem);
              setMessageList([].concat(elem.map((msg) => {
                return {
                    position:((socket.id === msg.sender) ? "right" : "left"),
                    type:"text",
                    text:msg.content,
                    title:msg.senderName,
                    date:msg.date
                };
              })));

          })
          .catch((err) => {
            console.log(err);
          });

        socket.on('receive-group-message ' + props.groupId , (msg) => {
            console.log('in receive group message ' + props.groupId + ' ' + msg.groupId);

            if(props.groupId ===  msg.groupId) {
            console.log('in receive-group-message '  + props.groupId);
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
        console.log(socket.listeners('receive-group-message ' + props.groupId));


        return () => {
            console.log('group chat component is being unmounted');
            socket.removeListener('receive-group-message ' + props.groupId);
          }
    }, []);

    const getCurrentList = () => {
        return messageList;
    }

    const clickMessageHandler = (e) => {
        console.log(socket._callbacks_);
        // console.log('logging: active listeners in click message handle');
        // console.log(socket.listeners('receive-group-message ' + props.groupId));
        console.log('sending message to ' + props.groupId);
        socket.emit('group-chat-message' , {content:message , sender:socket.id , senderName:props.userName , date:new Date(), groupId: props.groupId}); 
        setMessage('');
      };

    const changeNameHandler = (e) => {
    // console.log('logging: active listeners in change name handler');
    // console.log(socket.listeners('receive-group-message ' + props.groupId));
    setMessage(e.target.value);
    };
  return (
    <div className="GroupChat">
        <ol>
            {messageList.map((obj, index) => <li key={index}> Message 1  {obj.text} </li>)}
        </ol>

        <div className="messageBox">
              <h1> This is {props.groupId} group!</h1>
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
