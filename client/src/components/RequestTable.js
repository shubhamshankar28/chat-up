import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import {useState, React} from 'react';
import PropTypes from 'prop-types'; 
import Button from '@mui/material/Button';

export default function RequestTable(props) {
    const [membershipList, setMembershipList] = useState(props.memberShipRequests);
    const [existingMembersList,setExistingMembersList] = useState(props.existingMembers);
    let groupId = props.groupId;

    const clickAcceptRequestHandler = async (userId) => {
        let userName = sessionStorage.getItem('token');
        console.log('proposing membership');
        console.log(userName);
        console.log(props.groupId);
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

        let newExistingMembersList = [].concat(existingMembersList.filter((obj,) => {
            return (obj.username !== userId);
        }));
        setExistingMembersList(newExistingMembersList);
        console.log('fetch status is : ');
        console.log(result);
    };

    return <>
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
    </>;
}

RequestTable.propTypes = {
  memberShipRequests: PropTypes.any,
  existingMembers: PropTypes.any,
  groupId: PropTypes.any
}