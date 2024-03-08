import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login(){
    const [data, setData] = useState({
        email: '',
        password: ''
    });
    const navigate = useNavigate();

    const handleInputChange = (e)=>{
        setData({ ...data, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e)=>{
        e.preventDefault();
        try{
            const res = await axios.post('http://localhost:8000/login', data);
            const { _id, userName } = res.data;
            sessionStorage.setItem('userId', _id);
            sessionStorage.setItem('userName', userName);
            navigate('/');
        }catch(err){
            console.log(err);
        }
    }

    return(
        <>
            <h3>Login</h3>
            <form onSubmit={handleSubmit}>
                <input type='email' name='email' value={data.email} onChange={handleInputChange} placeholder="email" required />
                <input type='password' name='password' value={data.password} onChange={handleInputChange} placeholder="password" required />
                <button>login</button>
            </form>
        </>
    )
}
export default Login;