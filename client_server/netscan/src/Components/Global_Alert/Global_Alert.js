import React, { useEffect, useState } from 'react'
import './Global_Alert.css'
import axios from 'axios';
import { useParams } from 'react-router-dom';


const Global_Alert = () => {

    const { id } = useParams();

    const conf = require ('../../backend');
    const [alert, setAlert] = useState('');
    useEffect(() => {
        axios.get(`${conf}/settings/4`)
        .then(res => {
            if (res.data?.data){
                const ga = res.data.data[0]
                const alertval = ga.global_alert || '';

                if (alertval === null){

                    localStorage.removeItem('cur_alert');
                    
                }
                else{
                    
                    setAlert(alertval);
                    localStorage.setItem('cur_alert',alertval);
                    
                }
                
            }
        })
        .catch(err => {console.log(err)})
    }, [id]);
  return (
    <div className='global-alert'>
        {alert}
    </div>
  )
}

export default Global_Alert
