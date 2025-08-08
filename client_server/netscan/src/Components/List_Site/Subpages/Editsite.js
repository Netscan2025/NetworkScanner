import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import './Editsite.css';
import Navbar from '../../Nav_bar/Navbar';
import Breadcrum from '../../Breadcrum/Breadcrum';
import Footer from '../../Footer/Footer';
import axios from 'axios';

const Editsite = () => {
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

    const { id } = useParams();

    useEffect(() => {
      axios.get(`${conf}/site/${id}`)
        .then(res => {
          if (res.data?.data){
            const s = res.data.data[0]
            setName(s.site_name || '')
            setType(s.site_type || '')
            setStatus(s.site_status || '')
            setDesc(s.site_description || '')
          }
        })
        .catch(err => {console.log(err)})
    },[id]);

    function Submit_form(event){
        event.preventDefault();
        axios.patch(`${conf}/site/${id}`,{
            name: name,
            type: type,
            status: status,
            description: description,
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
            <h2 className='new-site-header'>Edit Site</h2>
            <ul>
                <li>Name:<input className='site-input' placeholder='Enter site name' value={name} onChange={(e)=> setName(e.target.value)}/></li>
                <li>Type:<input className='site-input' placeholder='Enter site type' value={type} onChange={(e)=> setType(e.target.value)}/></li>
                <li>Status:<input className='site-input' placeholder='Enter site status' value={status} onChange={(e)=> setStatus(e.target.value)}/></li>
                <li>Description:<input className='site-input' placeholder='Enter site description' value={description} onChange={(e)=> setDesc(e.target.value)}/></li>
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

export default Editsite;