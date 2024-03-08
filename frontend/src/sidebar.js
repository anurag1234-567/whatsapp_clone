import { useState, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import axios from 'axios';

const Sidebar = ({ setOtherUser, setShowProfile, user}) =>{
    const userId = sessionStorage.getItem('userId');
    const [otherUsers, setOtherUsers] = useState();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState();

    useEffect(()=>{
        const fetchdata = async()=>{
            try{
                const res = await axios.get('http://localhost:8000/users');
                let users = res.data; //here users represents all registered users
                users = users.filter(user => user._id !== userId); //remove cuurent user

                setOtherUsers(users);
                setResults(users);
            }catch(err){
                console.log(err);
            }
        }
        fetchdata();
    }, [userId])

    const handleQuery = (e)=>{
        const query = e.target.value;
        setQuery(query);

        const results = otherUsers.filter(otherUser => otherUser.userName.toLowerCase().includes(query) );
        setResults(results);
    }

    const handleClearQuery = ()=>{
        setQuery('');
        setResults(otherUsers);
    }

    return(
        <div className="sidebar">
            {
                user &&
                <div className='header'>
                    <img src={user.profileURL} alt='' onClick={()=>{ setShowProfile(true) }}/>
                    <p>{user.userName}</p>
                </div> 
            }

            <div className='searchbar'>
                <div className='input-wrp'>
                    <SearchIcon className='icons'/>
                    <input type='text' value={query} onChange={handleQuery} placeholder='Search or start new chat' />
                    { query && <ClearIcon className='icons' onClick={handleClearQuery}/> }
                </div>
            </div>

            <div className='list-wrp'>
                {
                    (results && results.length > 0) ? 
                    results.map((User, index)=>{
                        return  <div className='user' key={index} onClick={()=>{ setOtherUser(User) }}>
                                    <img src={User.profileURL} alt='' />
                                    <div className='content-wrp'>
                                        <p>{User.userName}</p>
                                    </div>
                                </div>
                    })
                    : <p>No Results found!</p>
                }
            </div>
        </div>
    )
}
export default Sidebar;
