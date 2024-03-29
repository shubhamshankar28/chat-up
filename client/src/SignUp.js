import {useState} from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Container } from '@mui/material';
import MyNavBar from './CustomNavbar';
import {Link, useNavigate} from 'react-router-dom';
import { useEffect} from 'react';
import Typography from '@mui/material/Typography';


const SignUp = (props) => {

    const [formValue,setFormValue] = useState('');
    const [password,setPassword] = useState('');

    const navigate = useNavigate();
    useEffect(()=> {
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

    const submitHandler = async (e) => {

        try {
            console.log('beginning post');
            let result =  await fetch('http://localhost:8000/signup', {
              method: "POST",
              body: JSON.stringify({"username" : formValue, "password":password}),
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            });

            console.log('navigating');
            navigate('/user');
            console.log(result);
          }
          catch(error) {
          console.log(error);
          } 
    };


    return (  
        <div className="random">

            <MyNavBar></MyNavBar>

            <Container maxWidth="sm">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="h3" gutterBottom>
            Welcome to Chat App
            <br/>
          </Typography>
          
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Sign Up
            <br/>
          </Typography>
          
        </div>



        <br/>
        <br/>
            
                <Stack direction="column" spacing={2}>
                    <TextField id="outlined-basic" label="Enter username" value={formValue} onChange = {(e) => setFormValue(e.target.value)}  />
                    <TextField id="outlined-basic" label="Password" type="password" value={password} onChange = {(e) => setPassword(e.target.value)}  />
                    <Button variant="contained" onClick = {submitHandler}>Enter</Button>
                </Stack>
            </Container>
            
        </div>
    );
}
 
export default SignUp;