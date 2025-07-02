import React from 'react';
import { useState,useEffect } from 'react';
import './Admin.css';
import Navbar from '../Nav_bar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import Footer from '../Footer/Footer';
import Breadcrum from '../Breadcrum/Breadcrum';

const Admin = () => {
    const cur_theme = localStorage.getItem('cur_theme');
    const [theme,settheme] = useState(cur_theme? cur_theme : 'light');
    useEffect(()=>{
        localStorage.setItem('cur_theme', theme)
    },[theme])
  return (
    <div className={`container ${theme}`}>
      <Navbar theme={theme} settheme={settheme}/>
      <Breadcrum/>
      <Sidebar/>
      <Footer/>
      
    </div>
  )
}

export default Admin
