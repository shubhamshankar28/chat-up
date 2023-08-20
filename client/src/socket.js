import { io } from "socket.io-client";
const socket = io("http://localhost:8000" , {autoConnect:false});
let username = null;
function setUserName(us) {
    username = us;
}
export {setUserName , username};

export default socket;
