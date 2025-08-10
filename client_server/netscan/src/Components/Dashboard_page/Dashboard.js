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
    
    const [sitecount, setsitecount] = useState(0)
    const [devicecount, setdevcount] = useState(0)
    const [usercount, setusercount] = useState(0)

    useEffect(() =>{
      axios.get(`${conf}/sites_count`)
      .then(res => {
        if (res.data?.data) {
          const sc = res.data.data[0];
          setsitecount(sc.site_count);
        }
      })
      .catch(err => console.log(err));

    }, []);
    useEffect(() =>{
      axios.get(`${conf}/device_count`)
      .then(res => {
        if (res.data?.data) {
          const dc = res.data.data[0]
          setdevcount(dc.device_count);
        }
      })
      .catch(err => console.log(err));

    }, []);
    useEffect(() =>{
      axios.get(`${conf}/user_count`)
      .then(res => {
        if (res.data?.data) {
          const uc = res.data.data[0]
          setusercount(uc.user_count);
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
            <div className='asset-value'>{sitecount}</div>
          </div>
          <div className='assets-info'>
            <div className='asset-title'>All Devices:</div>
            <div className='asset-value'>{devicecount}</div>
          </div>
          <div className='assets-info'>
            <div className='asset-title'>Users:</div>
            <div className='asset-value'>{usercount}</div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  )
}

export default Dashboard
