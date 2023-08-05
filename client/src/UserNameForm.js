import {useState} from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
const UserNameForm = (props) => {

    const [formValue,setFormValue] = useState('');

    const submitHandler = (e) => {
        e.preventDefault();
        props.clickUserName(formValue);
    };
    return (  
        <div className="userNameForm">
            <h1>Chat Up</h1>
            <br></br>
            <div className="center">
                <Stack direction="row" spacing={2}>
                    <TextField id="outlined-basic" label="Enter username" value={formValue} onChange = {(e) => setFormValue(e.target.value)}  />
                    <Button variant="contained" onClick = {submitHandler}>Enter</Button>
                </Stack>
            </div>
        </div>
    );
}
 
export default UserNameForm;