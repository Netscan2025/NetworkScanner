import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './Newuser.css';
import Navbar from '../../Nav_bar/Navbar';
import Breadcrum from '../../Breadcrum/Breadcrum';
import Footer from '../../Footer/Footer';
import axios from 'axios';

const Newuser = () => {
    const navigate = useNavigate();
    const conf = require ('../../../backend');
    const cur_theme = localStorage.getItem('cur_theme');
    const [theme,settheme] = useState(cur_theme? cur_theme : 'light');
    useEffect(()=>{
        localStorage.setItem('cur_theme', theme)
    },[theme])

    const [firstname,setfn] = useState('')
    const [lastname,setln] = useState('')
    const [email,setemail] = useState('')
    const [pass,setpass] = useState('')
    

    function Submit_form(event){
        event.preventDefault();
        axios.post(`${conf}/user`,{
            first_name: firstname,
            last_name: lastname,
            email: email,
            user_password: pass
        })
        .then(res => {
            console.log(res);
            navigate('/Admin/User_Management');
        })
        .catch(err => console.log(err));
    }

  return (
    <div className ={`container ${theme}`}>
        <Navbar theme={theme} settheme={settheme}/>
        <Breadcrum/>
        <div className='new-user-form'>
            <h2 className='new-user-header'>New User</h2>
            <ul>
                <li>First Name:<input className='user-input' placeholder='Enter first name' onChange={(e)=> setfn(e.target.value)}/></li>
                <li>Last Name:<input className='user-input' placeholder='Enter last name' onChange={(e)=> setln(e.target.value)}/></li>
                <li>Email:<input className='user-input' placeholder='Enter email' onChange={(e)=> setemail(e.target.value)}/></li>
                <li>Password:<input className='user-input' placeholder='Enter password' onChange={(e)=> setpass(e.target.value)}/></li>
            </ul>
            <div className='submit-form'>
                <div className='Save-user' onClick={(e) => Submit_form(e)}>Save</div>
                <div className='Cancel' onClick={() => navigate('/Admin/User_Management')}>Cancel</div>
            </div>
        </div>
        <Footer/>
    </div>
  )
}

export default Newuser
