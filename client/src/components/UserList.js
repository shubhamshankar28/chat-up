import PropTypes from 'prop-types'; 
import { useState, useEffect, React} from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket.js';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

function checkValidString(sample) {
  if((sample !== null) && (sample !== undefined) && (sample.length > 0))
    return true;
  return false;
}

export default function UserList(props) {
    console.log(props);
    const [userList, setUserList] = useState(props.userList);
    const groupId = props.groupId;
    const navigate = useNavigate();


    useEffect(() => {
        let userName = sessionStorage.getItem('token');
        if (userName === null) {
          navigate('/user');
        }

        if (!socket.connected) {
            socket.auth = { username: userName };
            console.log('connecting with username ' + socket.auth.username);
        }

        console.log('in UserList child component groupId: ' + groupId + ' userList ' + userList);
        socket.on('new-user-added ' + groupId, (msg) => {
            if (msg.username === undefined) {
              return;
            }
            console.log('new-user-added ' + groupId + ' ' + msg.username);
      
            if (groupId === msg.groupId) {
              console.log('in new-user-added ' + groupId);
              // console.log(messageList);
              setUserList(list => {
                console.log(list);
                if(!checkValidString(msg.username)) {
                  return list;
                }
                
                if (!list?.includes(msg.username))
                  return [...list, msg.username]
                else
                  return list;
              });
            }
          });
      
          socket.on('user-removed ' + groupId, (msg) => {
            if (msg.groupId === groupId) {
              console.log(msg.credential + ' is leaving ' + msg.groupId);
              setUserList(list => {
                let newList = [].concat(list.filter((element) => {
                  return (element !== msg.credential);
                }));
                return newList;
              });
            }
          });

          return () => {
            socket.removeAllListeners('new-user-added ' + groupId);
            socket.removeAllListeners('user-removed ' + groupId);
          }
    });

    return <>
            {
              userList?.map((username, index) => {
                return <><Card key={index} sx={{ marginBottom: 1, marginLeft: 1, marginRight: 1, backgroundColor: "#3e3c61" }}>
                  <CardContent>
                    <Typography sx={{ fontSize: 14, color: "#fff" }}>
                      {username}
                    </Typography>
                  </CardContent>
                </Card>
                </>
              })
            }
    </>
}

UserList.propTypes = {
  userList: PropTypes.any,
  groupId: PropTypes.string
}