import React from 'react';
import './Navbar.css';
import search_w from '../Assets/search-w.png';
import search_d from '../Assets/search-b.png';
import theme_w from '../Assets/day.png';
import theme_d from '../Assets/night.png';
import App from '../../App';
import { Link } from 'react-router-dom';

const Navbar = ({theme,settheme}) => {
    const toggle_mode = ()=>{
        theme === 'light' ? settheme('dark') : settheme('light');
    }
  return (
    <div className='navbar'>
        <img src='' alt='' className=''/>
        <ul>
            <Link className='nav-link' to="/Dashboard">Dashboard</Link>
            <Link className='nav-link' to="/Site">Site</Link>
<<<<<<< HEAD
            <Link className='nav-link' to="/Admin/Settings">Admin</Link>
=======
            <Link className='nav-link' to="/Admin">Admin</Link>
>>>>>>> 6f3e63ad2f66092ef80a1a0e0f644d4da0a5303a
            <Link className='nav-link' to="/About">About</Link>
        </ul>
        <div className='search-box'>
            <input type='text' placeholder='Search'/>
            <img src={theme === 'light' ? search_w : search_d} alt=''/>
        </div>

        <img onClick={()=>{toggle_mode()}} src={theme === 'light' ? theme_d : theme_w} alt='' className='theme-icon'/>

        <div className='user-profile'>

        </div>
    </div>
  )
}

export default Navbar

