import socket from './socket.js';
import {useEffect, useState} from 'react';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import "react-chat-elements/dist/main.css";
import {MessageList,ChatList,Popup} from "react-chat-elements";



function Chat(props) {

    const [messageList,setMessageList] = useState([]);
    const [message,setMessage] = useState('');
    const [usersList,setUsersList] = useState([]);

    useEffect(() => {

        socket.once('fetch message history' , (messageHistory) => {
          const listed = messageList.concat(messageHistory.map(
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

        socket.on('retrieve userlist' , (users) => {
            console.log('retrieve userlist event');
            const listed = [].concat(users.map(
              (elem) => {
                return {
                  title:elem.username
                }
              }
            ));
            console.log('result is ' + listed);
            setUsersList(listed);
         });

        socket.once('chat message' , (msg) => {
          console.log('in update messageList');
          const list = messageList.concat({
            position:((socket.id === msg.sender) ? "right" : "left"),
            type:"text",
            text:msg.content,
            title:msg.senderName,
            date:msg.date
          });
          setMessageList(list);
        });

        socket.on('user connected' , (userObject) => {

            const listed = usersList.concat({
              title:userObject.username
            });
            setUsersList(listed);
            alert(userObject.username + ' has joined');
        });

        socket.on('user disconnected' , (userObject) => { 

          const list = [].concat(usersList.filter((obj) => obj.title!==userObject.username))
          setUsersList(list);
          alert(userObject.username + ' has left');          
        });

        return () => {
          socket.removeAllListeners();
        }
    } , [messageList,usersList])

    const clickMessageHandler = (e) => {
      socket.emit('chat message' , {content:message , sender:socket.id , senderName:props.userName , date:new Date()}); 
      setMessage('');
    };

    const changeNameHandler = (e) => {
      setMessage(e.target.value);
    };

  return (
    <div className="Chat">         
        <Grid container spacing={4}>
          <Grid container item xs={2} direction="column">
              <ChatList className='chat-list'
                  dataSource={usersList}
              />
          </Grid>

          <Grid container item xs={10} direction="column">
            <MessageList
            className="messageList"
            lockable={true}
            toBottomHeight={"100%"}
            dataSource={messageList}
            />

          <Grid item>
            <div className="messageBox">
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
          </Grid>
          </Grid>
        </Grid>
    </div>
  );
}

export default Chat;
