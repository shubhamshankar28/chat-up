import {useState} from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Container } from '@mui/material';
import MyNavBar from './CustomNavbar';
import {Link, useNavigate} from 'react-router-dom';
import Typography from '@mui/material/Typography';


const UserNameForm = (props) => {

    const [formValue,setFormValue] = useState('');
    const navigate = useNavigate();


    const submitHandler = (e) => {
        e.preventDefault();
        navigate('/view-group' , {state:{formValue:formValue}});
    };


    return (  
        <div className="random">

            <MyNavBar state={{formValue}}></MyNavBar>

            <Container maxWidth="sm">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="h3" gutterBottom>
            Welcome to Chat App!!
          </Typography>
        </div>

        <br/>
        <br/>
            
                <Stack direction="row" spacing={2}>
                    <TextField id="outlined-basic" label="Enter username" value={formValue} onChange = {(e) => setFormValue(e.target.value)}  />
                    <Button variant="contained" onClick = {submitHandler}>Enter</Button>
                </Stack>
            </Container>
            
        </div>
    );
}
 
export default UserNameForm;