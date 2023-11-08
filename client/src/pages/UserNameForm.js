import { useState, useEffect, React } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import { Container } from '@mui/material';
import MyNavBar from '../components/MyNavbar';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';


const UserNameForm = () => {

  const [formValue, setFormValue] = useState('');
  const [password, setPassword] = useState('');
  const [popUp, setPopUp] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const d = new Date();
    console.log('-------');
    console.log(d + ': mounting login component');
    console.log('------');

    return () => {
      const d = new Date();
      console.log('-------');
      console.log(d + ': unmounting login component');
      console.log('------');
    }
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      let result = await fetch('http://localhost:8000/login', {
        method: "POST",
        body: JSON.stringify({ "username": formValue, "password": password }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log(result);
      if (result.status !== 200) {
        console.log('invalid authentication credentials !!!!')
        setPopUp(true);
      }
      else {
        const parsedResult = await result.json();
        if (parsedResult?.status)
          console.log('login: parsed result is ' + parsedResult);
        sessionStorage.setItem('token', parsedResult['token']);
        console.log('navigating to view-group');
        navigate('/view-group', { state: { formValue: formValue } });
        console.log(parsedResult);
      }
    }
    catch (error) {
      console.log(error);
    }
  };


  return (
    <div className="random">

      <MyNavBar state={{ formValue }}></MyNavBar>

      <Container maxWidth="sm">

        <Header variant="h3" text="ChatApp" />
        <Header variant="h5" text="Login" />


        <br />
        <br />

        <Stack direction="column" spacing={2}>
          <TextField id="outlined-basic" label="Enter username" value={formValue} onChange={(e) => setFormValue(e.target.value)} />
          <TextField id="outlined-basic" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button variant="contained" onClick={submitHandler}>Enter</Button>
        </Stack>

        <br />
        {popUp && <Alert severity="error">Invalid authentication credentials</Alert>}
      </Container>

    </div>
  );
}

export default UserNameForm;