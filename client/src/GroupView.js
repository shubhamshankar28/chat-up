import './App.css';
import Grid from '@mui/material/Grid';
import {useLoaderData,useLocation,useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MyNavBar from './CustomNavbar';
import { ChatItem } from 'react-chat-elements';
import socket from './socket.js';

export async function groupLoader() {
  console.log('in group loader');

  try {
  let response =   await fetch('http://localhost:8000/groups', {
    method: "GET",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
  let groupList = await response.json();
  console.log('fetched ' + groupList.length + ' messages')
  return {groupList};
  }
  catch(err) {
    console.log(err);
    let groupList = [];
    return {groupList};
  }
}

function GroupView(props) {


  const {groupList} = useLoaderData();
  const [groups,setGroups] = useState(groupList);
  const location= useLocation();
  const navigate = useNavigate();
  const state=location.state;
  const defaultAvatar = 'https://flxt.tmsimg.com/assets/p8553063_b_v13_ax.jpg';
  
  useEffect(() => {
    const d = new Date();
    console.log(d + ': mounting view-group component');

    
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

    console.log(d + ': logging : all event listeners');
    console.log(socket.listeners('new-group-added'));

    return () => {
      const d = new Date();
      console.log(d + ': view group component is going to be unmounted');
      socket.removeAllListeners('new-group-added');
    }
  } , []);

  console.log(state);
  console.log(groupList);

  const checkValidStringField = (query) => {
    if(query == null) {
      return false;
    }
    if(query.length === 0)
      return false;
    return true;
  }

  return (

    <div className="GroupView">

      <MyNavBar state={{formValue:state['formValue']}}></MyNavBar>
      
        <Grid container spacing={4}>
          {groups.map((obj, index) => {
            return <Grid item xs={12}>
                    <ChatItem title={obj.groupId} 
                    avatar = {checkValidStringField(obj.avatar) ? obj.avatar :defaultAvatar}
                    subtitle={checkValidStringField(obj.purpose) ? obj.purpose : `Welcome to ${obj.groupId}`}
                    onClick = {() => {
                      navigate(`/message/${obj.groupId}`,{state:location.state})
                    }} />
                    </Grid>
          })}
        </Grid>

    </div>
  );
}

export default GroupView;
