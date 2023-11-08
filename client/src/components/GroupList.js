import PropTypes from 'prop-types'; 
import { useState, useEffect, React } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket.js';
import { ChatItem } from 'react-chat-elements';
import Grid from '@mui/material/Grid';


export default function GroupList(props) {
    const [groups,setGroups] = useState(props.groupList);
    const navigate = useNavigate();
    const defaultAvatar = 'https://flxt.tmsimg.com/assets/p8553063_b_v13_ax.jpg';

    useEffect(() => {
        const userName = sessionStorage.getItem('token');
        console.log('logging username from sessionStorage : ');
        console.log(userName);
    
        if(!userName) {
          navigate('/user');
        }

        if(!socket.connected) {
            socket.auth = {username:userName};
            socket.connect();
            console.log('connecting with username '+ socket.auth.username);
          }

          socket.on('new-group-added' , (newGroup) => {
            console.log('call back for new-group added fired');
            console.log(newGroup);
            setGroups((previousGroups) => {
              return [...previousGroups, newGroup];
            });
          });

          return () => {
            socket.removeAllListeners('new-group-added');
          }
    });

    const checkValidStringField = (query) => {
        if(query == null) {
          return false;
        }
        if(query.length === 0)
          return false;
        return true;
      }

    return <>
          {groups.map((obj, index) => {
            return <Grid item xs={12} key={index}>
                    <ChatItem title={obj.groupId} 
                    avatar = {checkValidStringField(obj.avatar) ? obj.avatar :defaultAvatar}
                    subtitle={checkValidStringField(obj.purpose) ? obj.purpose : `Welcome to ${obj.groupId}`}
                    onClick = {() => {
                      navigate(`/message/${obj.groupId}`,{state:location.state})
                    }} />
                    </Grid>
          })}
    </>
}

GroupList.propTypes = {
  groupList: PropTypes.any,
}