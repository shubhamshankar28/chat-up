import Grid from '@mui/material/Grid';
import {useLoaderData,useLocation,useNavigate } from 'react-router-dom';
import { useEffect, React } from 'react';
import MyNavBar from '../components/MyNavbar';
import socket from '../socket.js';
import GroupList from '../components/GroupList';

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

function GroupView() {


  const {groupList} = useLoaderData();
  const location= useLocation();
  const navigate = useNavigate();
  const state=location.state;
  
  useEffect(() => {
    const d = new Date();
    console.log('-------');
    console.log(d + ': mounting view-group component');
    console.log('------');
    
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


    return () => {
      const d = new Date();
      console.log('-------');
      console.log(d + ': view group component is going to be unmounted');
      console.log('-------');
    }
  } , []);


  return (

    <div className="GroupView">

      <MyNavBar state={{formValue:state['formValue']}}></MyNavBar>
      
        <Grid container spacing={4}>
          <GroupList groupList={groupList}/>
        </Grid>

    </div>
  );
}

export default GroupView;
