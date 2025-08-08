import React from 'react'
import { useState,useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Settings.css';
import Navbar from '../../Nav_bar/Navbar';
import Sidebar from '../../Sidebar/Sidebar';
import Footer from '../../Footer/Footer';
import Breadcrum from '../../Breadcrum/Breadcrum';
import axios from 'axios';
import Global_Alert from '../../Global_Alert/Global_Alert';

const Settings = () => {

    const conf = require ('../../../backend');
    const cur_theme = localStorage.getItem('cur_theme');
    const [theme,settheme] = useState(cur_theme? cur_theme : 'light');
    useEffect(()=>{
        localStorage.setItem('cur_theme', theme)
    },[theme])

    const [key, setkey] = useState('');
    const [name, setName] = useState('');
    const [alert, setAlert] = useState('');
    const [update, setupdate] = useState('0');
  

    const cur_alert = localStorage.getItem('cur_alert');

    
    const { id } = useParams();

    useEffect(() => {
      axios.get(`${conf}/settings/${id}`)
        .then(res => {
          if (res.data?.data){
            const as = res.data.data[0]
            setName(as.company_name || '')
            setkey(as.api_key || '')
            setAlert(as.global_alert || '')
          }
        })
        .catch(err => {console.log(err)})
    },[id]);

    function submit_api(event){
      event.preventDefault();
      const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+" 
      let key = '';
      for (let i = 0; i < 32; i++){
        key += char.charAt(Math.floor(Math.random() * char.length));
      }
      
      axios.patch(`${conf}/settings/${id}`,{api_key: key})
      .then(res => {

        setkey(key);
        console.log('Key Successfully Generated')
      }) 
      .catch(err => console.log(err));
    }

    function submit_name(event){
      event.preventDefault();
      axios.post(`${conf}/settings`,{company_name: name, api_key: key, alert_message: alert})
      .then(res => {
        if (res.ok) {
          setkey(key);
          console.log('Account saved successfully!')
          setupdate('1');

        }
      }) 
      .catch(err => console.log(err));
    }

    function submit_update(event){
      event.preventDefault();
      axios.patch(`${conf}/settings/1`,{company_name: name, api_key: key, alert_message: alert})
      .then(res => {
        if (res.ok) {
          setkey(key);
          console.log('Account updated successfully!')

        }
      }) 
      .catch(err => console.log(err));
    }
    
  return (
    <div className={`container ${theme}`}>
      {cur_alert && <Global_Alert/>}
      <Navbar theme={theme} settheme={settheme}/>
      <Breadcrum/>
      <div className='setting-page'>
        <Sidebar/>
        <div className='setting-content'>
          <h2>Settings</h2>
          <div className='setting-tool'>
            <h3>Company Name</h3>
            <input className='company-name' placeholder='Host Company Name' value={name} onChange={(e) => setName(e.target.value)}/>
            <h3>API Key</h3>
            <input className='api-key' value={key} placeholder='Generate API Key'/>
          </div>
          <div className='submit-key'>
            {key===''?<div className='new-key' onClick={(e) => submit_api(e)}>Generate</div>:<div className='revoke-key' onClick={(e) => {setkey('')}}>Revoke</div>}
          </div>
          <div className='g-alert-container'>
            <h3>Global Alert</h3>
            <input className='g-alert' placeholder='Enter your global alert message here' value={alert} onChange={(e) => setAlert(e.target.value)}/>
          </div>
          <div className='submit-changes'>

            {update==='1'?<div className='setting-save' onClick={(e) => submit_update(e)}>Update</div>:<div className='setting-save' onClick={(e) => submit_name(e)}>Save</div>}
            
          </div>
        </div>
      </div> 
      <Footer/>
    </div>
  )
}

export default Settings;
