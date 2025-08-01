import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './New_Site.css';
import Navbar from '../../Nav_bar/Navbar';
import Breadcrum from '../../Breadcrum/Breadcrum';
import Footer from '../../Footer/Footer';
import axios from 'axios';

const New_Site = () => {
    const navigate = useNavigate();
    const conf = require ('../../../backend');
    const cur_theme = localStorage.getItem('cur_theme');
    const [theme,settheme] = useState(cur_theme? cur_theme : 'light');
    useEffect(()=>{
        localStorage.setItem('cur_theme', theme)
    },[theme])

    const [name,setName] = useState('')
    const [type,setType] = useState('')
    const [status,setStatus] = useState('')
    const [description,setDesc] = useState('')

    function Submit_form(event){
      const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" 
      let id = '';
      for (let i = 0; i < 32; i++){
        id += char.charAt(Math.floor(Math.random() * char.length));
      }
        event.preventDefault();
        axios.post(`${conf}/site`,{
            name: name,
            type: type,
            status: status,
            description: description,
            agent_id: id
        })
        .then(res => {
            console.log(res);
            navigate('/Site');
        })
        .catch(err => console.log(err));
    }
  return (

    <div className ={`container ${theme}`}>
        <Navbar theme={theme} settheme={settheme}/>
        <Breadcrum/>
        <div className='new-site-form'>
            <h2 className='new-site-header'>New Site</h2>
            <ul>
                <li>Name:<input className='site-input' placeholder='Enter site name' onChange={(e)=> setName(e.target.value)}/></li>
                <li>Type:<input className='site-input' placeholder='Enter site type' onChange={(e)=> setType(e.target.value)}/></li>
                <li>Status:<input className='site-input' placeholder='Enter site status' onChange={(e)=> setStatus(e.target.value)}/></li>
                <li>Description:<input className='site-input' placeholder='Enter site description' onChange={(e)=> setDesc(e.target.value)}/></li>
            </ul>
            <div className='submit-form'>
                <div className='Save-Site' onClick={(e) => Submit_form(e)}>Save</div>
                <div className='Cancel' onClick={() => navigate('/Site')}>Cancel</div>
            </div>
        </div>
        <Footer/>
    </div>
  )
}

export default New_Site;
