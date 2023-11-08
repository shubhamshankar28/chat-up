import { useState, React } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Container } from '@mui/material';
import MyNavBar from '../components/MyNavbar';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from '../components/Header';


const SignUp = () => {

  const [formValue, setFormValue] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  useEffect(() => {
    const d = new Date();
    console.log('-------');
    console.log(d + ': mounting signup component');
    console.log('------');

    return () => {
      const d = new Date();
      console.log('-------');
      console.log(d + ': unmounting signup component');
      console.log('------');
    }
  }, []);

  const submitHandler = async () => {

    try {
      console.log('beginning post');
      let result = await fetch('http://localhost:8000/signup', {
        method: "POST",
        body: JSON.stringify({ "username": formValue, "password": password }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('navigating');
      navigate('/user');
      console.log(result);
    }
    catch (error) {
      console.log(error);
    }
  };


  return (
    <div className="random">

      <MyNavBar></MyNavBar>

      <Container maxWidth="sm">
        <Header variant="h3" text="Welcome to Chat App" />
        <Header variant="h5" text="Sign Up" />


        <br />
        <br />

        <Stack direction="column" spacing={2}>
          <TextField id="outlined-basic" label="Enter username" value={formValue} onChange={(e) => setFormValue(e.target.value)} />
          <TextField id="outlined-basic" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button variant="contained" onClick={submitHandler}>Enter</Button>
        </Stack>
      </Container>

    </div>
  );
}

export default SignUp;