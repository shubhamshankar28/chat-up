import './App.css';
import {useState, useEffect} from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {useNavigate, useLocation} from 'react-router-dom';
import {  Container } from '@mui/material';
import MyNavBar from './CustomNavbar';

function CreateGroup() {
  const [dictionary, setDictionary] = useState({
    groupName : '',
    avatar: '',
    purpose: ''
  });


  const handleChange = (e) => {
    console.log(e.target);
    const {name,value} = e.target
    
    setDictionary((prevDictionary) => {
      return {
        ...prevDictionary,
        [name]:value
      }
    });
  };

  const navigate = useNavigate();
  const location = useLocation();
  const state=location.state;

  useEffect(() => {
    const d = new Date();
    console.log('-------');
    console.log(d + ': mounting create-group component');
    console.log('-------');

    const userName = sessionStorage.getItem('token');
    if(userName === null) {
      navigate('/user');
    }

    return () => {
      const d = new Date();
      console.log('-------');
      console.log(d + ': unmounting create-group component');
      console.log('-------');
    }
  })

  const handleSubmit = async (e) => {

      console.log("handling submit");
      try {
      
      // Create new group.
      let result =  await fetch('http://localhost:8000/groups', {
        method: "POST",
        body: JSON.stringify({"groupId" : dictionary.groupName, "avatar":dictionary.avatar, "purpose":dictionary.purpose}),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      console.log(result);
      
      // Grant current user admin rights to the new group.
      let _ = await fetch('http://localhost:8000/grantAdminRights/' + dictionary.groupName + '/' + sessionStorage.getItem('token') , {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      // Grant current user membership to the new group.
      _ = await fetch('http://localhost:8000/grantMembership/' + dictionary.groupName + '/' + sessionStorage.getItem('token') , {
        method: "GET",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      navigate('/view-group' , {state:location.state} )
    }
    catch(error) {
    console.log(error);
    }    
    console.log("done");
  }


  return (
    <div className="CreateGroup">

    <MyNavBar state={{formValue:state['formValue']}}></MyNavBar>

    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="h3" gutterBottom>
                Create Group
              </Typography>
    </div>

    <Container maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <TextField
          name = "groupName"
          label="Group Name"
          variant="outlined"
          margin="normal"
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          name = "avatar"
          label="Avatar"
          variant="outlined"
          margin="normal"
          fullWidth
          onChange={handleChange}
        />
        <TextField
          name = "purpose"
          label="Purpose"
          variant="outlined"
          margin="normal"
          onChange={ handleChange}
          fullWidth
        />
        <Button onClick={handleSubmit} variant="contained" color="primary" >
          Submit
        </Button>
      </form>
    </Container>

    </div>
  );
}

export default CreateGroup;
