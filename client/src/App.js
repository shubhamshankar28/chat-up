import './App.css';
import {useState} from 'react';
import Link from '@mui/material/Link';


function App() {

  return (
    <div className="App">
      <ul>
        <li>
          <Link href='/user'> Set User Name</Link>
        </li>
        <li>
          <Link href='/create-group'> Add Group</Link>
        </li>
        <li>
          <Link href='/view-group'>View Group</Link>
        </li>
      </ul>
    </div>
  );
}

export default App;
