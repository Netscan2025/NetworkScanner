import React from 'react'
import { useState,useEffect } from 'react';
import './Net_account.css';
import Navbar from '../Nav_bar/Navbar';
import Footer from '../Footer/Footer';
import Breadcrum from '../Breadcrum/Breadcrum';
import btn_id from '../Assets/id-rotation.png';
import axios from 'axios';

const Net_account = () => {

    const cur_theme = localStorage.getItem('cur_theme');
    const [theme,settheme] = useState(cur_theme? cur_theme : 'light');
    useEffect(()=>{
        localStorage.setItem('cur_theme', theme)
    },[theme])

    const [device,setDevice] = useState([]);

    const conf = require ('../../backend');

    const [id,setid] = useState('');

    const [details,setdetails] = useState([]);

    useEffect(() => {
      axios.get(`${conf.BES_URL}/devices`)
      .then(res => {
        if (res?.data){
          setDevice(res.data)
        }
      })
      .catch(err => {console.log(err)})
    })

    useEffect(() => {
      axios.get(`${conf.BES_URL}/details`)
      .then(res => {
        if (res?.data){
          setdetails(res.data)
        }
      })
      .catch(err => {console.log(err)})
    })

    function submit_id(event){
      event.preventDefault();
      const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" 
      let id = '';
      for (let i = 0; i < 32; i++){
        id += char.charAt(Math.floor(Math.random() * char.length));
      }
      axios.post(`${conf.BES_URL}/details`,{id: id})
      .then(res => {

        setid(id);
        console.log('Key Successfully Generated')
      }) 
      .catch(err => console.log(err));
    }

  return (
    <div className={`container ${theme}`}>
        <Navbar theme={theme} settheme={settheme}/>
        <Breadcrum/>
        <div className='net-page'>
            <h1>{setdetails.name}</h1>
            <div className='agent-id'>
                Agent ID:
                <input className='input-id' placeholder='Agent ID' value={id}/>
                <img src={btn_id} alt='' onClick={(e) => submit_id(e)}/>
                <div className='btn-agent'>Download Agent</div>
                <div className='btn-daigram'>View Daigram</div>
            </div>
            <div className='ip-range'>
                IP Range:
                <input className='input-ip' placeholder='Enter IP Range, For e.g.: 192.168.1.1/24' value={setdetails.ip_range}/>
            </div>
            <div className='alldevice-content'>
                <table>
                    <thead>
                        <tr>
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

export default Net_account
