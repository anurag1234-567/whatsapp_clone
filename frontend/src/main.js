import { useState, useEffect } from 'react';
import Sidebar from "./sidebar";
import Profile from "./profile";
import Preview from "./preview";
import Chatbox from "./chatbox";
import axios from 'axios';
import io from 'socket.io-client';

function Main(){
    const userId = sessionStorage.getItem('userId');
    const [user, setUser] = useState({
        userName: '',
        profileURL: '',
        about: ''
    })

    const [onlineUsers, setOnlineUsers] = useState([]); // represent all online users
    const [typingUsers, setTypingUsers] = useState([]); // represent all user who are typing
    const [otherUser, setOtherUser] = useState();
    const [showProfile, setShowProfile] = useState(false);
    const [socket, setSocket] = useState(null);

    useEffect(()=>{
        const fetchdata = async()=>{
            try{
                const res = await axios.post('http://localhost:8000/user', { _id: userId });
                setUser(res.data);
            }catch(err){
                console.log(err);
            }
        }
        fetchdata();
    }, [userId]);

    useEffect(()=>{
        const newSocket = io('http://localhost:4000', {
            reconnection: true,
            reconnectionAttempts: 2,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });
        newSocket.emit('userId', { _id: userId });

        const handleUsers = (data)=>{
            setOnlineUsers(data);
            console.log(data);
        }

        const handleTypingUsers = (data)=>{
            setTypingUsers(data);
            console.log(data);
        }

        newSocket.on('users', handleUsers);
        newSocket.on('typing', handleTypingUsers)
        newSocket.on('stop-typing', handleTypingUsers);

        setSocket(newSocket);

        return ()=>{
            setSocket(null);
            newSocket.off('users', handleUsers);
            newSocket.off('typing', handleTypingUsers);
            newSocket.off('stop-typing', handleTypingUsers);
            newSocket.disconnect();
        }
    }, [userId]);

    return(
        <div className='main'>
            <Profile showProfile={showProfile} setShowProfile={setShowProfile} setUser={setUser}/>
            <Sidebar setOtherUser={setOtherUser} setShowProfile={setShowProfile} user={user}/>
            {
                otherUser  ? <Chatbox  socket={socket} onlineUsers={onlineUsers} typingUsers={typingUsers} otherUser={otherUser} /> : <Preview /> 
            }
        </div>
    )
}
export default Main;