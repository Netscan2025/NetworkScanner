import React from 'react'
import { useState,useEffect } from 'react';
import './All_devices.css';
import Navbar from '../../Nav_bar/Navbar';
import Sidebar from '../../Sidebar/Sidebar';
import Footer from '../../Footer/Footer';
import Breadcrum from '../../Breadcrum/Breadcrum';
import axios from 'axios';

const All_devices = () => {

    const cur_theme = localStorage.getItem('cur_theme');
    const [theme,settheme] = useState(cur_theme? cur_theme : 'light');
    useEffect(()=>{
        localStorage.setItem('cur_theme', theme)
    },[theme])

    const [device,setDevice] = useState([]);
    const conf = require ('../../../backend')

    useEffect(() => {
      axios.get(`${conf.BES_URL}/all_devices`)
      .then(res => {
        if (res?.data){
          setDevice(res.data)
        }
      })
      .catch(err => {console.log(err)})
    })

  return (
    <div className={`container ${theme}`}>
      <Navbar theme={theme} settheme={settheme}/>
      <Breadcrum/>
      <div className='alldevice-page'>
        <Sidebar/>
        <div className='alldevice-content'>
          <h2>Global Device</h2>
          <table>
            <thead>
              <tr>
                <th>Site</th>
                <th>Name</th>
                <th>Status</th>
                <th>Type</th>
                <th>IP Address</th>
                <th>Mac Address</th>
              </tr>
            </thead>
            <tbody>
              {device.length > 0? device.map(() => {
                <tr key={device.id} >
                  <td>{device.site}</td>
                  <td>{device.name}</td>
                  <td>{device.status}</td>
                  <td>{device.type}</td>
                  <td>{device.ip_address}</td>
                  <td>{device.mac_address}</td>
                </tr>
              }): <tr className='no-device'>
                    <td colSpan={7} rowSpan={10}>
                      "No device to show"
                    </td>
                </tr>}
            </tbody>
          </table>
        </div>
      </div>
      <Footer/>
    </div>
  )
}

export default All_devices
