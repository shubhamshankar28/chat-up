import './App.css';
import GroupChat from './GroupChat.js';
import {Link, useLoaderData,useLocation } from 'react-router-dom';
export async function groupLoader() {

  try {
  let response =   await fetch('http://localhost:8000/groups', {
    method: "GET",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  let groupList = await response.json();
  return {groupList};
  }
  catch(err) {
    console.log(err);
    let groupList = [];
    return {groupList};
  }
}

function GroupView(props) {


  const {groupList} = useLoaderData();
  const location= useLocation();
  const state=location.state;
  console.log(state);

  console.log(groupList);
  return (
    <div className="GroupView">
        <ol>
            {groupList.map((obj, index) => <li key={index}><Link to={`/message/${obj.groupId}`} state={state}>{obj.groupId}</Link></li>)}
        </ol>
        <h1>Unimplemented</h1>
    </div>
  );
}

export default GroupView;
