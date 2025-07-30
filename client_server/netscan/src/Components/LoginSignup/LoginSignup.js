import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './LoginSignup.css'
import user_icon from '../Assets/user.png'
import email_icon from '../Assets/mail.png'
import pass_icon from '../Assets/locked-computer.png'
import axios from 'axios'

const LoginSignup = () => {

    const conf = require ('../../backend.js');
    console.log(conf);
    const navigate = useNavigate();
    const [action,setAction] = useState("Sign Up");
    const [name,setName] = useState('')
    const [email,setEmail] = useState('')
    const [password,setPassword] = useState('')

    function LoginSubmit(event){
        event.preventDefault();
        axios.post(`${conf}/login`,{
            email: event.email, 
            password: event.password
        
        })
        .then(res => {
            console.log(res)
            if (res.ok){
                navigate('/Dashboard');
            }
        })
        .catch(err => console.log(err));
    }

    function SignupSubmit(event){
        event.preventDefault();
        axios.post(`${conf}/signup`,{
            name: event.name, 
            email: event.email, 
            password: event.password
        })
        .then(res => {
            console.log(res)
            if (res.ok){
                navigate('/');
            }
        })   
        .catch(err => console.log(err));
    }

    return (
        <div className='Login-container'>
            <div className='header'>
                <div className='text'>{action}</div>
                <div className='underline'></div>
            </div>
            <div className='inputs'>
                {action==="Login"?<div></div>:
                <div className='input'>
                    <img src={user_icon} alt='' />
                    <input type='text' placeholder='Name'
                    onChange={(e) => setName(e.target.value)}/>
                </div>}
                <div className='input'>
                    <img src={email_icon} alt='' />
                    <input type='email' placeholder='Email'
                    onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className='input'>
                    <img src={pass_icon} alt='' />
                    <input type='password' placeholder='Password'
                    onChange={(e) => setPassword(e.target.value)}/>
                </div>
            </div>
            {action==="Sign Up"?<div></div>:<div className="forgot-password" onClick={<forgotpass/>}>Forgot Password?</div>}

            <div className='submit-container'>
                {action==="Login"?<div></div>:<div className='create-account' onClick={(e) => SignupSubmit(e)}>Create Account</div>}
                {action==="Sign Up"?<div></div>:<div className='login-button' onClick={(e) => LoginSubmit(e)}>Login</div>}
            </div>
            <div className='Login_Signup-container'>
                <div className={action==="Login"?"submit gray":"submit"} onClick={()=>{setAction("Sign Up")}} >Sign Up</div>
                <div className={action==="Sign Up"?"submit gray":"submit"} onClick={()=>{setAction("Login")}}  >Login</div>
            </div>
        </div>
    )
}

export default LoginSignup
