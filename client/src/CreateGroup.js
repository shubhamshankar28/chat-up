import './App.css';
import {useState} from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import {useNavigate} from 'react-router-dom';


function CreateGroup() {
  const [groupName, setGroupName] = useState('');
  const navigate = useNavigate();

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
    }).then(() => {
      console.log('navigating');
      navigate('/view-group')
    }).catch((err) => {
      console.log(err);
    });
  };

  return (
    <div className="CreateGroup">

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

export default CreateGroup;
