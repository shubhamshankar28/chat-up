import './App.css';
import Grid from '@mui/material/Grid';
import {useLoaderData,useLocation,useNavigate } from 'react-router-dom';
import MyNavBar from './CustomNavbar';
import { ChatItem } from 'react-chat-elements';

export async function groupLoader() {

  try {
  let response =   await fetch('http://localhost:8000/groups', {
    method: "GET",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  let groupList = await response.json();
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
  const location= useLocation();
  const navigate = useNavigate();
  const state=location.state;
  const defaultAvatar = 'https://flxt.tmsimg.com/assets/p8553063_b_v13_ax.jpg';
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
          {groupList.map((obj, index) => {
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
