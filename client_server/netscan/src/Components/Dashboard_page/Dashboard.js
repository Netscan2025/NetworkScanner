import React from 'react';
import { useState,useEffect } from 'react';
import Navbar from '../Nav_bar/Navbar';
import Breadcrum from '../Breadcrum/Breadcrum';
import Footer from '../Footer/Footer'

const Dashboard = () => {
    const cur_theme = localStorage.getItem('cur_theme');
    const [theme,settheme] = useState(cur_theme? cur_theme : 'light');
    useEffect(()=>{
        localStorage.setItem('cur_theme', theme)
    },[theme])

  return (
    <div className={`container ${theme}`}>
      <Navbar theme={theme} settheme={settheme}/>
      <Breadcrum/>
      <Footer/>
    </div>
  )
}

export default Dashboard
