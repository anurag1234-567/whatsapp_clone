import { useState, useRef, useEffect } from 'react';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import SendIcon from '@mui/icons-material/Send';
import DownloadIcon from '@mui/icons-material/Download';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import AddIcon from '@mui/icons-material/Add';
import EmojiPicker from 'emoji-picker-react';
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import moment from 'moment';
import axios from 'axios';

const Chatbox = ({ socket, onlineUsers, typingUsers, otherUser }) =>{
    const userId = sessionStorage.getItem('userId');
    const [message, setMessage] = useState('');
    const [groupMessages, setGroupMessages] = useState({});
    const [showEmoji, setShowEmoji] = useState(false);
    const [showScroller, setShowScroller] = useState(false);
    const containerRef = useRef();
    const inputRef = useRef();
            
    const addMessage = (data)=>{
        let date = new moment(data.createdAt).format('DD MMM YYYY');

        setGroupMessages(groupMessages =>{
            const updatedMessages = { ...groupMessages };

            if(!updatedMessages[date]){
                updatedMessages[date] = [];
            }
    
            updatedMessages[date].push(data);
            return updatedMessages;
     })
    }

    useEffect(()=>{
        const handleMessage = (data)=>{
            if(data.senderId === otherUser._id){
                addMessage(data);
            }
        }

        if(socket){
            socket.on('message', handleMessage);
        }

        return ()=>{
            socket.off('message', handleMessage);
        }

    }, [otherUser, socket])

    useEffect(()=>{
        const fetchdata = async()=>{
            try{
                const res = await axios.post('http://localhost:8000/get-messages', { userId, otherUserId: otherUser._id });
                let messages = res.data;
                messages.reverse();
                const groupMessages = groupMessagesByDate(messages);

                setGroupMessages(groupMessages);
            }catch(err){
                console.log(err);
            }
        }
        fetchdata();
    }, [userId, otherUser]);
    
    useEffect(()=>{
        scrollToBottom();
    }, [groupMessages]);

    const handleScroll = ()=>{
        if(!containerRef.current) return;

        const container = containerRef.current;
        if(container.scrollHeight > (container.scrollTop + container.clientHeight + 20)){
            setShowScroller(true); return;
        }
        setShowScroller(false);
    }

    const scrollToBottom = ()=>{
        if(containerRef.current){
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }

    const findStatus = ()=>{
        if(!otherUser || onlineUsers.length < 1) return '';

        const typing = typingUsers.some(user => user._id === otherUser._id);
        if(typing) return 'typing...';

        const online = onlineUsers.some(user => user._id === otherUser._id);
        return online ? 'Online' : 'Offline';
    }

    const handleSend = async()=>{
        try{
            const data = { senderId: userId, receiverId: otherUser._id, content: message };
            setMessage('');

            const res = await axios.post('http://localhost:8000/save-message', data);
           
            addMessage(res.data);
            setShowEmoji(false);
            
            socket.emit('message', res.data);
            socket.emit('stop-typing', { _id: userId });
        }catch(err){
            console.log(err);
        }
    }

    const handleInputChange = (e)=>{
        const value = e.target.value;

        if(message.trim() === '' && value.trim() !== '') socket.emit('typing', { _id: userId });
        if(message.trim() !== '' && value.trim() === '') socket.emit('stop-typing', { _id: userId });

        setMessage(value);
    }
    
    const handleKeyUp = (e)=>{
        if(e.key === 'Enter') handleSend();
    }
    
    const ToggleShowEmoji = ()=>{ setShowEmoji(showEmoji => !showEmoji) }
    const handleEmojiClick = (emojiObject)=>{ setMessage(message => message + emojiObject.emoji) }

    const groupMessagesByDate = (messages)=>{
        const groupMessages = {};
        messages.forEach(message =>{
            let date = new moment(message.createdAt).format('DD MMM YYYY');

            //if key is not exist in object then insert it. This key will be date and its value will be array of messages.
            if(!groupMessages[date]){
                groupMessages[date] = [];
            }

            groupMessages[date].push(message);
        })
        return groupMessages;
    }

    const handleFileClick = ()=>{ inputRef.current.click(); }

    const handleFileSelection = (e)=>{
        const file = e.target.files[0];
        if(!file) return;

        uploadfile(file);
    }

    const uploadfile = async(file)=>{
        try{
          const metaData = {
              contentType: file.type,
              contentDisposition: 'attachment'
          };
          const timestamp = new Date().getTime();
          const startTime = new Date();
          const storageRef = ref(storage, `${timestamp}_${file.name}`);
    
          await uploadBytes(storageRef, file, metaData);
          const url = await getDownloadURL(storageRef);
          const endTime = new Date();
          alert(`url received ${endTime - startTime} milliseconds`);

          //save uploaded file to database
          const data = { senderId: userId, receiverId: otherUser._id, name: file.name, size: file.size, url };
          const res = await axios.post('http://localhost:8000/save-media', data);

          //show this message and send to receipients
          addMessage(res.data);
          socket.emit('message', res.data);
        }catch(err){
          console.log(err);
          alert('error occurs');
        }
      }

    const renderMessage = (message, index)=>{
        const type = message.type;
        const formatedDate = new moment(message.createdAt).format('h:mm a');
        const action = message.senderId === userId ? 'send' : 'receive';

        if(type === 'text'){
            return  <div className={`message ${action}`} key={index}>
                        <p className='content'>{message.content}</p>
                        <p className='time'>{formatedDate}</p>
                    </div>
        }

        //else render media file
        const extension = message.file.extension;

        if(extension === 'jpg' || extension === 'png'){
            return   <div className={`img-wrp ${action}`} key={index}>
                        <img src={message.file.url} alt='' />
                        <a href={message.file.url}><DownloadIcon className='icon' /></a>
                        <p className='time'>{formatedDate}</p>
                    </div>
        }else if(extension === 'mp4'){
            return  <div className={`video-wrp ${action}`} key={index}>
                        <video className='video' src={message.file.url} type='vide/mp4' controls/>
                    </div>
        }else{
            let iconPath;
            const fileSize = (message.file.size / (1024 * 1024)).toFixed(2);

            switch(extension){
                case "pdf": iconPath = 'pdf.png'; break;
                case "docx":
                case "doc": iconPath = 'docx.png'; break;
                case "ppt":
                case "pptx": iconPath = 'pptx.png'; break;
                case "txt": iconPath = 'txt.png'; break;
                default: iconPath = null;
            }

            return  <div className={`file ${action}`} key={index}>
                        <div className='file-content'>
                            <img src={iconPath} alt='' />
                            <div>
                                <p className='heading1'>{message.file.name}</p>
                                <p className='heading2'>{`${extension} • ${fileSize} MB`}</p>
                            </div>
                            <a href={message.file.url}><DownloadIcon className='icon' /></a>
                        </div>
                        <div className='time'>{formatedDate}</div>
                    </div>
        } //end of else statement
    }

    return(
        <div className="chatbox">
            <div className='header'>
                <img src={otherUser.profileURL} alt='' />
                <div>
                    <p>{otherUser.userName}</p>
                    <p>{findStatus()}</p>
                </div>
            </div>

            <div className='message-wrp' ref={containerRef} onScroll={handleScroll}>
            {   groupMessages && 
                Object.keys(groupMessages).map(date =>{
                    return(
                        <div key={date} className='group-message-wrp'>
                            <div className='date'>{date}</div>
                            { groupMessages[date].map((message, index) =>{
                                return renderMessage(message, index)
                            } )}
                            
                        </div>
                    )
                })
            }
            </div>

            <div className='footer'>
                { showScroller && <KeyboardArrowDownOutlinedIcon className='scroller' onClick={scrollToBottom}/> }

                <EmojiEmotionsOutlinedIcon className='icons' onClick={ToggleShowEmoji}/>
                <AddIcon className='icons' onClick={handleFileClick}/>
                <input type='file' ref={inputRef} onChange={handleFileSelection} style={{ display: 'none' }}/>

                <input type='text' value={message} placeholder='Type a message' onChange={handleInputChange} onKeyUp={handleKeyUp}/>
                {
                    message.trim().length > 0 ? <SendIcon className='icons' onClick={handleSend}/> : <KeyboardVoiceIcon className='icons'/>
                }

                {
                    showEmoji &&
                    <div className='emojiPicker-wrp'>
                        <EmojiPicker height="100%" width="100%" searchDisabled="true" onEmojiClick={handleEmojiClick} />
                    </div>
                }
            </div>
        </div>
    )
}
export default Chatbox;