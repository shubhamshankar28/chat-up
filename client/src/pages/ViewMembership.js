import {useEffect, React} from 'react';
import { useLoaderData} from 'react-router-dom';
import MyNavBar from '../components/MyNavbar';
import Header from '../components/Header';
import RequestTable from '../components/RequestTable';

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

function ViewMembership() {
    
    const {memberShipRequests, groupId, existingMembers} = useLoaderData();
  
    useEffect(() => {
      const d = new Date();
      console.log('-------');
      console.log(d + ': mounting view-membership component');
      console.log('-------');

      return () => {
        const d = new Date();
        console.log('-------');
        console.log(d + ': unmounting view-membership component');
        console.log('-------');
      }
    }, []);

  return (
    <div className="GroupChat">

        <MyNavBar state={{formValue:sessionStorage.getItem('token')}}></MyNavBar>
        
        <Header variant="h3" text={"Membership requests for " + groupId}/>
        <br/>
        <br/>
        <RequestTable existingMembers={existingMembers} memberShipRequests={memberShipRequests} groupId={groupId}/>
    </div>
  );
}

export default ViewMembership;
