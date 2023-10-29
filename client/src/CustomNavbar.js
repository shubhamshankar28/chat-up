import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import {Link} from 'react-router-dom';
const MyNavBar = (props) => {
  // console.log(props.state?.isAdmin);
  // console.log(props.state?.groupId);
  return (
    <div className='randoms'>
      <Navbar bg="dark" data-bs-theme="dark">
          <Navbar.Brand href="#home">ChatApp</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="#"><Link to='/'>Sign Up</Link></Nav.Link>
            <Nav.Link href="#"><Link to='/user'> Login</Link></Nav.Link>
            {!(props.state === undefined) && <Nav.Link href="#"><Link to="/create-group" state={props.state}> Add Group</Link></Nav.Link>}
            {!(props.state === undefined) && < Nav.Link href="#"><Link 
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

export default MyNavBar;