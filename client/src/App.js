import './App.css';
import {useState} from 'react';
import UserNameForm from './UserNameForm';
import Chat from './Chat';
import socket from './socket';

function App() {
  const [userName,setUserName] = useState(null);

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

  return (
    <div className="App">
      {!userName && <UserNameForm clickUserName={clickUserName} />}
      {userName && <Chat userName={userName}/>}
    </div>
  );
}

export default App;
