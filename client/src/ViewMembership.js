import './App.css';
import {useState, useEffect} from 'react';
import socket from './socket.js';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useLoaderData, useLocation, useNavigate } from 'react-router-dom';
import { MessageList } from 'react-chat-elements';
import MyNavBar from './CustomNavbar';
import { Container } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

export async function membershipLoader({params}) {
  
  console.log('in membership loader');
  let groupId = params.groupId;
  console.log(groupId);

  try {

    let finMemberShipRequests;
    let existingMembers;

    const memberShipRequests = await fetch('http://localhost:8000/viewMembershipRequests/' + groupId, {
    method: "GET",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    });

    let currentMembers = await fetch('http://localhost:8000/retrieveMembers/' + groupId, {
        method: "GET",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        });

    finMemberShipRequests =await memberShipRequests.json();
    existingMembers = await currentMembers.json();

    console.log(existingMembers);

    return {memberShipRequests : finMemberShipRequests, groupId, existingMembers };
    }
    catch(err) {
      console.log(err);
    return {memberShipRequests : [], groupId, existingMembers : []};
    }
}

function ViewMembership(props) {
    
    const {memberShipRequests, groupId, existingMembers} = useLoaderData();
    const [membershipList, setMembershipList] = useState(memberShipRequests);
    const [existingMembersList,setExistingMembersList] = useState(existingMembers)
  
    useEffect(() => {

    }, []);

    const clickAcceptRequestHandler = async (userId) => {
        let userName = sessionStorage.getItem('token');
        console.log('proposing membership');
        console.log(userName);
        console.log(groupId);
        let result = await fetch('http://localhost:8000/grantMembership/' + groupId + '/' + userId, {
          method: "GET",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });


        let finResult = await result.json();
        console.log('fetch status is : ');
        console.log(result);
        setMembershipList(finResult);
    };

    const clickGrantAdminRightsHandler = async (userId) => {
        let userName = sessionStorage.getItem('token');
        console.log('proposing membership');
        console.log(userName);
        console.log(groupId);
        let result = await fetch('http://localhost:8000/grantAdminRights/' + groupId + '/' + userId, {
          method: "POST",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        let newExistingMembersList = [].concat(existingMembersList.filter((obj,index) => {
            return (obj.username !== userId);
        }));
        setExistingMembersList(newExistingMembersList);
        console.log('fetch status is : ');
        console.log(result);
    };

    

  return (
    <div className="GroupChat">

        <MyNavBar state={{formValue:sessionStorage.getItem('token')}}></MyNavBar>
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="h3" gutterBottom>
            Membership Requests for {groupId}
          </Typography>
        </div>
        
        <br/>
        <br/>


        <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Access Type</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {membershipList.map((row,index) => (
            <TableRow key={index}>
              <TableCell>{row?.username}</TableCell>
              <TableCell> <Button variant="contained" onClick = {() => {
                clickAcceptRequestHandler(row?.username);
            }}>
              User
              </Button>
              </TableCell>
            </TableRow>
          ))}

        {existingMembersList.map((row,index) => (
                    <TableRow key={index}>
                      <TableCell>{row?.username}</TableCell>
                      <TableCell> <Button variant="contained" onClick = {() => {
                        clickGrantAdminRightsHandler(row?.username);
                    }}>
                      Admin
                      </Button>
                      </TableCell>
                    </TableRow>
                  ))}

        </TableBody>
      </Table>
    </TableContainer>

        {/* <Grid container spacing={4}>
          {membershipList.map((obj, index) => {
            return <Grid item xs={12}>
        <div key={index} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            Approve membership for {obj?.username} 
            <Button variant="contained" onClick = {() => {
                clickAcceptRequestHandler(obj?.username);
            }}>Enter</Button>
        </div>
            </Grid>
          })}

          {existingMembersList.map((obj, index) => {
            return <Grid item xs={12}>
        <div key={index} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{margin:15}}>
                Grant admin rights to {obj?.username} 
            </div>
            <Button  variant="contained" onClick = {() => {
                clickGrantAdminRightsHandler(obj?.username);
            }}>Enter</Button>
        </div>
            </Grid>
          })}
        </Grid> */}

    </div>
  );
}

export default ViewMembership;
