import './App.css';
import {useState} from 'react';
import UserNameForm from './UserNameForm';
import Chat from './Chat';
import socket from './socket';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import GroupView from './GroupView.js';

function App() {
  const [userName,setUserName] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [defaultPersonalView, setDefaultPersonalView] = useState(false);

  const clickUserName = (value) => {
    socket.auth = {username:value};
    socket.connect();
  
    socket.on("connect_error", (err) => {
      if (err.message === "invalid username") {
        this.usernameAlreadySelected = false;
      }
    });


    console.log("control reachers user name setting");
    setUserName(value);
    console.log("username setting done");
  }

  const changeGroupNameHandler = (e) => {
    setGroupName(e.target.value);
  };

  const clickGroupNameHandler = (e) => {
    console.log('click group name fired');
    fetch('http://localhost:8000/groups', {
      method: "POST",
      body: JSON.stringify({"groupId" : groupName}),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }).catch((err) => {
      console.log(err);
    });
  };

  return (
    <div className="App">
      {!userName && 
        <UserNameForm clickUserName={clickUserName} />
      }
      {(userName && defaultPersonalView) && <Chat userName={userName}/>}

      {(!defaultPersonalView && userName) && <GroupView />}



      <div className="messageField">
        <TextField
        id="outlined-textarea"
        value={groupName}
        onChange={changeGroupNameHandler}
        multiline
        fullWidth
        />
      </div>

      <Button variant="contained" onClick = {clickGroupNameHandler}>Add Group</Button>
    </div>
  );
}

export default App;
