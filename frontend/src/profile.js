import { useState, useEffect, useRef } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import axios from 'axios';

const Profile = ({ showProfile, setShowProfile, setUser }) =>{
    const userId = sessionStorage.getItem('userId');
    const inputRef = useRef(null);
    const [currentUser, setCurrentUser] = useState({
        userName: '',
        profileURL: '',
        about: ''
    });
    const [edit, setEdit] = useState('');

    useEffect(()=>{
        const fetchdata = async()=>{
            try{
                const res = await axios.post('http://localhost:8000/user', { _id: userId });
                setCurrentUser(res.data);
            }catch(err){
                console.log(err);
            }
        }
        fetchdata();
    }, [userId]);

    const handleFileClick = ()=>{
        inputRef.current.click();
    }

    const handleFileSelection = (e)=>{
        const file = e.target.files[0];

       if(!file || !file.type.startsWith('image/')) return;
       uploadfile(file);
    }

    const uploadfile = async(file)=>{
        try{
          const timestamp = new Date().getTime();
          const storageRef = ref(storage, `files/${timestamp}_${file.name}`);
    
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);

          const updatedProfile = {  _id: userId, ...currentUser, profileURL: url };
          const res = await axios.post('http://localhost:8000/edit-profile', updatedProfile);

          setCurrentUser(res.data);
          setUser(res.data);
        }catch(err){
          console.log(err);
        }
      }

    const handleInputChange = (e) =>{
        console.log(e.target.value);
        setCurrentUser({ ...currentUser, [e.target.name]: e.target.value });
    }

    const handleSave = async()=>{
        try{
            const res = await axios.post('http://localhost:8000/edit-profile', { _id: userId, ...currentUser });
            setUser(res.data); 
            setEdit('');
        }catch(err){
            console.log(err);
        }
    }

    return(
        <div className={ showProfile ? 'profile active' : 'profile'} >
            <div className='header'>
                <ArrowBackIcon className='arrow' onClick={()=>{ setShowProfile(false) }}/> Profile
            </div>

            <div className='img-wrp'>
                <img src={currentUser.profileURL} alt='' />
                <div className='hidden-content' onClick={handleFileClick}>
                    <CameraAltIcon className='camera-icon'/>
                    <p>Change</p>
                    <p>Profile Photo</p>
                </div>
                <input type='file' ref={inputRef} accept='image/*' onChange={handleFileSelection} style={{ display: 'none' }} />
            </div>


            <div className='content'>
                <div className='row1'>
                    Your name
                </div>

                <div className='row2'>
                    {
                        edit === 'name' ?
                        <>
                          <input type='text' name='userName' value={currentUser.userName} onChange={handleInputChange}/>
                          <CheckIcon className='icon' onClick={handleSave}/>
                        </>
                        :
                        <>
                          <p>{currentUser.userName}</p>
                          <EditIcon className='icon' onClick={()=>{ setEdit('name') }}/>
                        </>
                    }
                </div>
            </div>

            <div className='content'>
                <div className='row1'>
                    About
                </div>

                <div className='row2'>
                    {
                        edit === 'about' ?
                        <>
                          <input type='text' name='about' value={currentUser.about} onChange={handleInputChange}/>
                          <CheckIcon className='icon' onClick={handleSave}/>
                        </>
                        :
                        <>
                          <p>{currentUser.about}</p>
                          <EditIcon className='icon' onClick={()=>{ setEdit('about') }}/>
                        </>
                    }
                </div>
            </div>
        </div>
    )
}
export default Profile;