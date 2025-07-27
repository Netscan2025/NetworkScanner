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
<<<<<<< HEAD
        {path.includes('new')?<Link className='breadcrum-link currentpath' to="/Site/New">\  Create Site </Link>:<Link></Link>}
        {path.includes('Admin')?<Link className='breadcrum-link currentpath' to="/Admin/Settings">\  Admin </Link>:<Link></Link>}
        {path.includes('About')?<Link className='breadcrum-link currentpath' to="/About">\  About </Link>:<Link></Link>}
        {path.includes('Settings')?<Link className='breadcrum-link currentpath' to="/Admin/Settings">\  Settings</Link>:<Link></Link>}
        {path.includes('All_Devices')?<Link className='breadcrum-link currentpath' to="/Admin/All_Devices">\  All Devices </Link>:<Link></Link>}
        {path.includes('User_Management')?<Link className='breadcrum-link currentpath' to="/Admin/User_Management">\ User Management </Link>:<Link></Link>}
        {path.includes('New_User')?<Link className='breadcrum-link currentpath' to="/Admin/User/New_User">\  Create User </Link>:<Link></Link>}
        {path.includes('Integration')?<Link className='breadcrum-link currentpath' to="/Admin/Integration">\  Integrations </Link>:<Link></Link>}
        {path.includes('Device')?<Link className='breadcrum-link currentpath' to="/Device">\  Device </Link>:<Link></Link>}
=======
        {path.includes('Admin')?<Link className='breadcrum-link currentpath' to="/Admin">\  Admin </Link>:<Link></Link>}
        {path.includes('Settings')?<Link className='breadcrum-link currentpath' to="/Settings">\  Settings</Link>:<Link></Link>}
        {path.includes('All_Devices')?<Link className='breadcrum-link currentpath' to="/All_Devices">\  All Devices </Link>:<Link></Link>}
        {path.includes('User_Management')?<Link className='breadcrum-link currentpath' to="/User_Management">\ User Management </Link>:<Link></Link>}
        {path.includes('Integrations')?<Link className='breadcrum-link currentpath' to="/Integration">\  Integrations </Link>:<Link></Link>}
>>>>>>> 6f3e63ad2f66092ef80a1a0e0f644d4da0a5303a
      </ul>
    </div>
  )
}

export default Breadcrum
