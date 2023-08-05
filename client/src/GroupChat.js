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

        console.log(socket.id);

        socket.once('fetch message history' , (messageHistory) => {
            const listed = [].concat(messageHistory.filter((msg) => {
                return (msg.groupId === props.groupId)
            }).map(
              (msg) => {
                  return {
                  position:((msg.senderName === props.userName) ? "right" : "left"),
                  type:"text",
                  text:msg.content,
                  title:msg.senderName,
                  date:msg.date
                };
              }
            ));
            setMessageList(listed);
          });

        socket.once('receive-group-message ' + props.groupId , (msg) => {
            console.log('in receive group message ' + props.groupId + ' ' + msg.groupId);

            if(props.groupId ===  msg.groupId) {
            console.log('in receive-group-message '  + props.groupId);
            console.log(msg);
            console.log('in update messageList ' + props.groupId);
            const list = messageList.concat({
              position:((socket.id === msg.sender) ? "right" : "left"),
              type:"text",
              text:msg.content,
              title:msg.senderName,
              date:msg.date
            });
            setMessageList(list);
        }
        });

        return () => {
            socket.removeListener('receive group message ' + props.groupId);
            socket.removeListener('fetch message history');
          }
    }, [messageList]);

    const clickMessageHandler = (e) => {
        console.log('sending message to ' + props.groupId);
        socket.emit('group-chat-message' , {content:message , sender:socket.id , senderName:props.userName , date:new Date(), groupId: props.groupId}); 
        setMessage('');
      };

    const changeNameHandler = (e) => {
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
