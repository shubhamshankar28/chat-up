import './App.css';
import {useState, useEffect} from 'react';
import GroupChat from './GroupChat.js';


function GroupView(props) {

  const [groupList, setGroupList] = useState([]);

  useEffect(() => {
    console.log('in group view');
    fetch('http://localhost:8000/groups', {
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then((res) => {
        return res.json();
    })
    .then((elem) => {
        setGroupList([].concat(elem))
    })
    .catch((err) => {
      console.log(err);
    });
  }, []);

  return (
    <div className="GroupView">
        <ol>
            {groupList.map((obj, index) => <li key={index}><GroupChat groupId={obj.groupId}/></li>)}
        </ol>
        <h1>Unimplemented</h1>
    </div>
  );
}

export default GroupView;
