import React from 'react'
import './Footer.css'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';

const Footer = () => {
    const cur_theme = localStorage.getItem('cur_theme');
    const [theme,settheme] = useState(cur_theme? cur_theme : 'light');
    useEffect(()=>{
        localStorage.setItem('cur_theme', theme)
    },[theme])
  return (

    <div className='contianer-footer'>
      <footer className='footer-content'>
        © 2025 NetScan. All rights reserved.
      </footer>
    </div>
  )
}

export default Footer
