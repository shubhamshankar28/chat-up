import { useState, useEffect,React } from 'react';
import socket from '../socket.js';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useLoaderData, useNavigate } from 'react-router-dom';
import MyNavBar from '../components/MyNavbar.js';
import { Grid } from '@mui/material';
import "../groupChatStyles.css";
import Header from '../components/Header';
import UserList from '../components/UserList';
import ChatMessageList from '../components/ChatMessageList';

function checkValidString(sample) {
  if((sample !== null) && (sample !== undefined) && (sample.length > 0))
    return true;
  return false;
}

async function retrieveUsers(groupId, userName) {
  let users = await fetch('http://localhost:8000/users/' + groupId + '/' + userName, {
    method: "GET",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
  let usersList = await users.json();


  console.log(usersList);

  if ('status' in usersList) {
    return null;
  }

  if (!usersList?.includes(userName)) {
    usersList.push(userName);
  }

  let finalUserList = usersList.filter((obj) => {
    return checkValidString(obj);
  }) 

  console.log(finalUserList);

  return finalUserList;
}

export async function groupChatLoader({ params }) {

  console.log('group chat loader has been triggered');
  let groupId = params.groupId;
  console.log(groupId);

  const userName = sessionStorage.getItem('token');
  if ((userName === null)) {
    return;
  }

  try {
    let response = await fetch('http://localhost:8000/messages/' + params.groupId + '/' + userName, {
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    let adminStatus = await fetch('http://localhost:8000/checkAdminRights/' + params.groupId + '/' + userName, {
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });




    let groupChatRaw = await response.json();
    let adminStatusRaw = await adminStatus.json();
    let usersList = await retrieveUsers(params.groupId, userName);

    console.log('loading raw group chat');
    console.log(groupChatRaw);
    console.log('loading admins status');
    console.log(adminStatusRaw);
    console.log('loading users ');
    console.log(usersList);

    if (('status' in groupChatRaw) && (groupChatRaw['status'] === 'user is not a member of group')) {
      return { groupChatList: [], groupId, status: '400', adminStatusRaw }
    }

    let groupChatList = groupChatRaw.map((msg) => {
      return {
        position: ((socket.id === msg.sender) ? "right" : "left"),
        type: "text",
        text: msg.content,
        title: msg.senderName,
        date: msg.date
      }
    });

    return { groupChatList, groupId, status: '200', adminStatus: adminStatusRaw['adminStatus'], usersList };
  }
  catch (err) {
    console.log(err);
    let groupChatList = [];
    return { groupChatList, groupId, status: '200', adminStatus: false };
  }
}



function GroupChat() {

  const { groupChatList, groupId, status, adminStatus, usersList } = useLoaderData();

  const cleanedGroupChatList = amend(groupChatList);


  const [isMember, setIsMember] = useState(false);
  const [currentAdminStatus, setCurrentAdminStatus] = useState(adminStatus);

  const navigate = useNavigate();


  function amend(groupChatList) {
    return [].concat(groupChatList.map((msg) => {
      let userName = sessionStorage.getItem('token');
      let newMessage = msg;
      newMessage['position'] = ((msg['title'] === userName) ? "right" : "left");
      return newMessage;
    }));
  }



  useEffect(() => {

    const d = new Date();
    console.log('-------');
    console.log(d + ': mounting group-chat component');
    console.log('------');

    if (status === '400') {
      console.log('current user is not a member');
      setIsMember(false);
      return;
    }
    setIsMember(true);

    let userName = sessionStorage.getItem('token');
    if (userName === null) {
      navigate('/user');
    }

    socket.on("connect_error", (err) => {
      if (err.message === "invalid username") {
        this.usernameAlreadySelected = false;
      }
    });

    socket.on("membership-approved", () => {
      setIsMember(true);
    });

    socket.on("admin-status-granted", () => {
      setCurrentAdminStatus(true);
    })

    socket.on("disconnect", () => {
      console.log("socket connection has been disconnected on the client side");
    });


    console.log('scrolling to the bottom at mount');


    return () => {
      const d = new Date();
      console.log('-------');
      console.log(d + ': unmounting group-chat component');
      console.log('------');
      socket.removeAllListeners('disconnect');
      socket.removeAllListeners('membership-approved');
      socket.removeAllListeners('admin-status-granted');
      socket.removeAllListeners('connect_error');
    }
  }, []);

  const clickMembershipHandler = async () => {
    let userName = sessionStorage.getItem('token');
    console.log('proposing membership');
    console.log(userName);
    console.log(groupId);
    let result = await fetch('http://localhost:8000/proposeMembership', {
      method: "POST",
      body: JSON.stringify({ "username": userName, "groupId": groupId }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    console.log('fetch status is : ');
    console.log(result);

    navigate('/view-group', { state: { formValue: userName } });
  };

  return (
    <div>
      <MyNavBar state={{ isAdmin: currentAdminStatus, groupId }}></MyNavBar>

      {!isMember &&
      <div> 
      <Header variant="h3" text={groupId} />
      <br/>
        </div>
      }

      {!isMember &&
        <div className="userNotFound">
          <Header variant="h4" text={"You are not a member of " + groupId} />
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button variant="contained" onClick={clickMembershipHandler}>Propose Membership</Button>
          </div>
        </div>
      }

      {isMember &&
        <Grid container spacing={2}>
          <Grid item xs={2} sx={{ background: "#2f2d52" }}>
            <br />
            <Typography variant="h4" sx={{ color: "#fff" }}>
              Active Users
            </Typography>
          </Grid>

          <Grid item xs={10} sx={{ background: "#3e3c61" }}>
            <br />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: "#fff" }}>
              <Typography variant="h3" gutterBottom>
                {groupId}
              </Typography>
            </div>
          </Grid>

          <Grid item xs={2} sx={{ background: "#3e3c61" }}>
            <UserList userList={usersList} groupId={groupId} />
          </Grid>

          <Grid item xs={10} sx={{ background: "#a7bcff" }}>
            <ChatMessageList groupChatList={cleanedGroupChatList} groupId={groupId}/>
          </Grid>
        </Grid>}
    </div>
  );
}

export default GroupChat;
