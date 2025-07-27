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
<<<<<<< HEAD
        <li><Link className='side-link' to="/Admin/Settings">Settings</Link></li>
        <li><Link className='side-link'to="/Admin/All_Devices">All Devices</Link></li>
        <li><Link className='side-link'to="/Admin/User_Management">User Management</Link></li>
        <li><Link className='side-link'to="/Admin/Integration">Integrations</Link></li>
=======
        <li><Link className='side-link' to="/Settings">Settings</Link></li>
        <li><Link className='side-link'to="/All_Devices">All Devices</Link></li>
        <li><Link className='side-link'to="/User_Management">User Management</Link></li>
        <li><Link className='side-link'to="/Integration">Integrations</Link></li>
>>>>>>> 6f3e63ad2f66092ef80a1a0e0f644d4da0a5303a
      </ul>
    </div>
  )
}

export default Sidebar
