import React from 'react';
import './Dashboard.css'
import { useState,useEffect } from 'react';
import Navbar from '../Nav_bar/Navbar';
import Breadcrum from '../Breadcrum/Breadcrum';
import Footer from '../Footer/Footer'
import axios from 'axios';
import Global_Alert from '../Global_Alert/Global_Alert';

const Dashboard = () => {
    const cur_theme = localStorage.getItem('cur_theme');
    const [theme,settheme] = useState(cur_theme? cur_theme : 'light');
    useEffect(()=>{
        localStorage.setItem('cur_theme', theme)
    },[theme])

    const conf = require ('../../backend');

    const cur_alert = localStorage.getItem('cur_alert');
    
    const [site_count, setsitecount] = useState("0")
    const [device_count, setdevcount] = useState("0")
    const [user_count, setusercount] = useState("0")

    useEffect(() =>{
      axios.get(`${conf.BES_URL}/sites_count`)
      .then(res => {
        if (res?.data) {
          setsitecount(res.data);
        }
      })
      .catch(err => console.log(err));

    }, []);
    useEffect(() =>{
      axios.get(`${conf.BES_URL}/device_count`)
      .then(res => {
        if (res?.data) {
          setdevcount(res.data);
        }
      })
      .catch(err => console.log(err));

    }, []);
    useEffect(() =>{
      axios.get(`${conf.BES_URL}/user_count`)
      .then(res => {
        if (res?.data) {
          setusercount(res.data);
        }
      })
      .catch(err => console.log(err));

    }, []);
  return (
    <div className={`container ${theme}`}>
      {cur_alert && <Global_Alert/>}
      <Navbar theme={theme} settheme={settheme}/>
      <Breadcrum/>
      <div className='dash-page'>
        <h1 className='dash-title'>Dashboard</h1>
        <div className='dash-content'>
          <div className='assets-info'>
            <div className='asset-title'>Network Sites:</div>
            <div className='asset-value'>{site_count}</div>
          </div>
          <div className='assets-info'>
            <div className='asset-title'>All Devices:</div>
            <div className='asset-value'>{device_count}</div>
          </div>
          <div className='assets-info'>
            <div className='asset-title'>Users:</div>
            <div className='asset-value'>{user_count}</div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  )
}

export default Dashboard
