import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import {Link} from 'react-router-dom';
const MyNavBar = (props) => {
  return (
    <div className='randoms'>
      <Navbar bg="dark" data-bs-theme="dark">
          <Navbar.Brand href="#home">ChatApp</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="#"><Link href='/user'> Login</Link></Nav.Link>
            {!(props.state === undefined) && <Nav.Link href="#"><Link to="/create-group" state={props.state}> Add Group</Link></Nav.Link>}
            {!(props.state === undefined) && < Nav.Link href="#pricing"><Link 
                    to="/view-group"
                    state={props.state}
                >View Group</Link></Nav.Link>}
          </Nav>
      </Navbar>
    </div>
  );
}

export default MyNavBar;