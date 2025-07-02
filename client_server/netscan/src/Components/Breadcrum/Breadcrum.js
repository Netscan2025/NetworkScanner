import React from 'react'
import './Breadcrum.css'
import { useState,useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';


const Breadcrum = () => {
    const cur_theme = localStorage.getItem('cur_theme');
    const [theme,settheme] = useState(cur_theme? cur_theme : 'light');
    useEffect(()=>{
        localStorage.setItem('cur_theme', theme)
    },[theme])

    const loc = useLocation();
    const path = loc.pathname.split('/').filter(Boolean)

  return (
    <div className='container-breadcrum'>
      <ul>
        <Link className='breadcrum-link' to="/Dashboard"> NetScan</Link>
        {path.includes('Site')?<Link className='breadcrum-link currentpath' to="/Site">\  Site </Link>:<Link></Link>}
        {path.includes('Admin')?<Link className='breadcrum-link currentpath' to="/Admin">\  Admin </Link>:<Link></Link>}
        {path.includes('Settings')?<Link className='breadcrum-link currentpath' to="/Settings">\  Settings</Link>:<Link></Link>}
        {path.includes('All_Devices')?<Link className='breadcrum-link currentpath' to="/All_Devices">\  All Devices </Link>:<Link></Link>}
        {path.includes('User_Management')?<Link className='breadcrum-link currentpath' to="/User_Management">\ User Management </Link>:<Link></Link>}
        {path.includes('Integrations')?<Link className='breadcrum-link currentpath' to="/Integration">\  Integrations </Link>:<Link></Link>}
      </ul>
    </div>
  )
}

export default Breadcrum
