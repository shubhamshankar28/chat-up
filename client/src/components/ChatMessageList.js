import PropTypes from 'prop-types'; 
import { useState, useEffect, useRef, React } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket.js';
import { MessageList } from 'react-chat-elements';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Container} from '@mui/material';


export default function ChatMessageList(props) {
  console.log(props);
    const [messageList, setMessageList] = useState(props?.groupChatList);
    const [userName, setUserName] = useState('');
    const [message, setMessage] = useState('');
    const groupId = props.groupId;
    const navigate = useNavigate();
    const messagesEndRef = useRef(null)

    const scrollBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        let username = sessionStorage.getItem('token');
        if (username === null) {
          navigate('/user');
        }

        if (!socket.connected) {
            socket.auth = { username: username };
            console.log('connecting with username ' + socket.auth.username);
        }

        socket.on('receive-group-message ' + groupId, (msg) => {
          console.log('in receive group message ' + groupId + ' ' + msg.groupId);
    
          if (groupId === msg.groupId) {
            console.log('in receive-group-message ' + groupId);
            const message = {
              position: ((userName === msg.senderName) ? "right" : "left"),
              type: "text",
              text: msg.content,
              title: msg.senderName,
              date: msg.date
            };
            // console.log(messageList);
            setMessageList(list => [...list, message]);
            console.log('scrolling to the bottom');
            scrollBottom();
          }
        });

        socket.emit('join-group', { groupId, sender: socket.id, credential: userName });

        setUserName(username);
        scrollBottom();

          return () => {
            socket.removeAllListeners('receive-group-message ' + groupId);
          }
    });

    const clickMessageHandler = () => {
      let userName = sessionStorage.getItem('token');
      socket.emit('join-group', { groupId, sender: socket.id, credential: userName });
      // socket.emit('join-group', {groupId, sender:socket.id});
      console.log(socket._callbacks_);
      console.log('logging: active listeners in click message handle');
      console.log(socket.listeners('receive-group-message ' + groupId));
      console.log('sending message to ' + groupId);
      socket.emit('group-chat-message', { content: message, sender: socket.id, senderName: userName, date: new Date(), groupId: groupId });
      setMessage('');
    };
  

    const changeMessageHandler = (e) => {
      setMessage(e.target.value);
    };

    return <>
            <div className='messagesWrapper'>
              <MessageList
                className="messageList"
                lockable={true}
                toBottomHeight={"100%"}
                dataSource={messageList}
              />
              <div ref={messagesEndRef} />
            </div>

            <Container maxWidth="sm" sx={{ marginBottom: "5px" }}>
              <Stack direction="row" spacing={2}>
                <TextField id="outlined-basic"
                  label="Enter message"
                  value={message}
                  onChange={changeMessageHandler}
                  fullWidth
                  sx={{ background: "#fff" }} />
                <Button variant="contained" onClick={clickMessageHandler}>Enter</Button>
              </Stack>
            </Container>
    </>
}

ChatMessageList.propTypes = {
  groupChatList: PropTypes.any,
  groupId: PropTypes.string
}