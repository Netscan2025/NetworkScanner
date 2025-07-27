import React from 'react'
import { useState,useEffect } from 'react';
import './Device.css';
import Navbar from '../Nav_bar/Navbar';
import Footer from '../Footer/Footer';
import Breadcrum from '../Breadcrum/Breadcrum';
import axios from 'axios';

const Device = () => {
    const cur_theme = localStorage.getItem('cur_theme');
    const [theme,settheme] = useState(cur_theme? cur_theme : 'light');
    useEffect(()=>{
        localStorage.setItem('cur_theme', theme)
    },[theme])

    const [device,setDevice] = useState([]);

    const conf = require ('../../backend');
    useEffect(()=>{
        axios.get(`${conf.BES_URL}/devices`)
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
        <div className='device-page'>
            <h1>{device.name}</h1>
            <div className='device-content'>
                Name:
                <input className='show-details' placeholder='Device Name' value={device.name}/>
                Status:
                <input className='show-details' placeholder='Status' value={device.status}/>
                Type:
                <input className='show-details' placeholder='Type' value={device.type}/>
                Hostname:
                <input className='show-details' placeholder='Hostname' value={device.hostname}/>
                Vendor:
                <input className='show-details' placeholder='Vendor' value={device.vendor}/>
                Device Interface:
                <div className='device-interface'>
                    <table>
                        <thead>
                            <tr>
                                <th>Port</th>
                                <th>Interface</th>
                                <th>IP Address</th>
                                <th>MAC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {device.interface > 1 ? device.interface.map((interfaces) => (<tr key = {interfaces.id}>
                                <td>{interfaces.port}</td>
                                <td>{interfaces.name}</td>
                                <td>{interfaces.ip_address}</td>
                                <td>{interfaces.mac_address}</td>
                                
                            </tr>)) : <tr>
                                <td>{device.ip_address}</td>
                                <td>{device.mac_address}</td>
                            </tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <Footer/>
    </div>
  )
}

export default Device
