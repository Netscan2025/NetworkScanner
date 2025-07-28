import React from 'react'
import './Sidebar.css'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
const Sidebar = () => {
    const cur_theme = localStorage.getItem('cur_theme');
    const [theme,settheme] = useState(cur_theme? cur_theme : 'light');
    useEffect(()=>{
        localStorage.setItem('cur_theme', theme)
    },[theme])

  return (
    <div className='container-sidebar'>
      <ul>
        <li><Link className='side-link' to="/Admin/Settings">Settings</Link></li>
        <li><Link className='side-link'to="/Admin/All_Devices">All Devices</Link></li>
        <li><Link className='side-link'to="/Admin/User_Management">User Management</Link></li>
        <li><Link className='side-link'to="/Admin/Integration">Integrations</Link></li>
      </ul>
    </div>
  )
}

export default Sidebar
