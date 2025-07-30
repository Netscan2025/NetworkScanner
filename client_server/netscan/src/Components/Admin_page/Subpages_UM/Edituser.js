import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import './Edituser.css';
import Navbar from '../../Nav_bar/Navbar';
import Breadcrum from '../../Breadcrum/Breadcrum';
import Footer from '../../Footer/Footer';
import axios from 'axios';

const Edituser = () => {
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
    const { id } = useParams();
    
    useEffect(() => {
      axios.get(`${conf}/user/${id}`)
        .then(res => {
          if (res.data?.data){
            const u = res.data.data[0]
            setfn(u.first_name || '')
            setln(u.last_name || '')
            setemail(u.email || '')
          }
        })
        .catch(err => {console.log(err)})
    },[id]);

    function Submit_edit_form(event){
        event.preventDefault();
        axios.patch(`${conf}/user/${id}`,{
            first_name: firstname,
            last_name: lastname,
            email: email
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
            <h2 className='new-user-header'>Edit User</h2>
            <ul>
                <li>First Name:<input className='user-input' placeholder='Enter first name' value={firstname} onChange={(e)=> setfn(e.target.value)}/></li>
                <li>Last Name:<input className='user-input' placeholder='Enter last name' value={lastname} onChange={(e)=> setln(e.target.value)}/></li>
                <li>Email:<input className='user-input' placeholder='Enter email' value={email} onChange={(e)=> setemail(e.target.value)}/></li>
            </ul>
            <div className='submit-form'>
                <div className='Save-user' onClick={(e) => Submit_edit_form(e)}>Save</div>
                <div className='Cancel' onClick={() => navigate('/Admin/User_Management')}>Cancel</div>
            </div>
        </div>
        <Footer/>
    </div>
  )
}

export default Edituser
