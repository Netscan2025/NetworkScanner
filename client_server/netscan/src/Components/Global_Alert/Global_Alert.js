import React, { useEffect, useState } from 'react'
import './Global_Alert.css'
import axios from 'axios';


const Global_Alert = () => {
    const conf = require ('../../backend');
    const [alert, setAlert] = useState('');
    useEffect(() => {
        axios.get(`${conf.BES_URL}/settings`)
        .then(res => {
            if (res?.data){
                setAlert(res.data.alert_message);
                let cur_alert = localStorage.setItem('cur_alert',alert);
            }
        })
        .catch(err => {console.log(err)})
    }, []);
  return (
    <div className='global-alert'>
        {alert}
    </div>
  )
}

export default Global_Alert
