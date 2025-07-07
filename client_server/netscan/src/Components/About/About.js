import React from 'react'
import { useEffect, useState } from 'react'
import './About.css';
import Navbar from '../../Components/Nav_bar/Navbar';
import Breadcrum from '../../Components/Breadcrum/Breadcrum';
import Footer from '../../Components/Footer/Footer';
const About = () => {
    const cur_theme = localStorage.getItem('cur_theme');
    const [theme,settheme] = useState(cur_theme? cur_theme : 'light');
    useEffect(()=>{
        localStorage.setItem('cur_theme', theme)
    },[theme])
  return (
    
    <div className={`container= ${theme}`}>
        <Navbar theme={theme} settheme={settheme}/>
        <Breadcrum/>   
        <p className='about-details'>
            This is project created by Omkar Shinde and Navpreet to show case our learning.
            Thank you for visiting!
        </p>
        <Footer/>
    </div>
  )
}

export default About
