import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import {Link} from 'react-router-dom';
import {useState, useEffect, React} from 'react';
import socket from '../socket.js';
import PropTypes from 'prop-types'; 

const MyNavBar = (props) => {
  // console.log(props.state?.isAdmin);
  // console.log(props.state?.groupId);
  const [userName,setUserName] = useState('');

  useEffect(() => {
    const d = new Date();
    console.log('-------');
    console.log(d + ': mounting nav-bar component');
    console.log('-------');
    let username = sessionStorage.getItem('token');
    console.log(username);
    setUserName(username);
    console.log('username: ' + userName);
    if(username !== null) {
      setUserName(sessionStorage.getItem('token'));
    }
    return () => {
      const d = new Date();
      console.log('-------');
      console.log(d + ': unmounting nav-bar component');
      console.log('-------');
    }
   }, []);

  return (
    <div className='randoms'>
      <Navbar bg="dark" data-bs-theme="dark">
          <Navbar.Brand href="#home">ChatApp</Navbar.Brand>
          <Nav className="me-auto">
            { (userName === null || userName.length === 0) && 
              <Nav.Link href="#"><Link to='/'>Sign Up</Link></Nav.Link>
            }
            { (userName === null || userName.length === 0) && 
             <Nav.Link href="#"><Link to='/user'> Login</Link></Nav.Link>
            }
            { ((userName !== null) && (userName.length !== 0))  && 
             <Nav.Link href="#" onClick={()=>{
              sessionStorage.removeItem('token');
              socket.disconnect();
             }}><Link to='/user'> Logout</Link></Nav.Link>
            }

            {(!(props.state === undefined) && (userName !== null && userName.length !== 0)) && <Nav.Link href="#"><Link to="/create-group" state={props.state}> Add Group</Link></Nav.Link>}
            {(!(props.state === undefined) && (userName !== null && userName.length !== 0)) && < Nav.Link href="#"><Link 
                    to="/view-group"
                    state={props.state}
                >View Group</Link></Nav.Link>}
            { (props?.state?.isAdmin) && < Nav.Link href="#"><Link 
                    to={'/view-membership/' + props?.state?.groupId}
                >View Membership Requests</Link></Nav.Link>}
          </Nav>
      </Navbar>
    </div>
  );
}

MyNavBar.propTypes = {
  state:PropTypes.any
}

export default MyNavBar;