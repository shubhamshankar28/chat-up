import {useState} from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import {Link, useNavigate} from 'react-router-dom';

const UserNameForm = (props) => {

    const [formValue,setFormValue] = useState('');
    const navigate = useNavigate();


    const submitHandler = (e) => {
        e.preventDefault();
        navigate('/view-group' , {state:{formValue:formValue}});
    };


    return (  
        <div className="userNameForm">
            <h1>Chat Up</h1>
            <ul>
                <li>
                <Link href='/user'> Set User Name</Link>
                </li>
                <li>
                <Link to="/create-group"> Add Group</Link>
                </li>
                <li>
                <Link 
                    to="/view-group"
                    state={{formValue}}
                >View Group</Link>
                </li>
            </ul>
            <br></br>
                <Stack direction="row" spacing={2}>
                    <TextField id="outlined-basic" label="Enter username" value={formValue} onChange = {(e) => setFormValue(e.target.value)}  />
                    <Button variant="contained" onClick = {submitHandler}>Enter</Button>
                </Stack>
            
        </div>
    );
}
 
export default UserNameForm;