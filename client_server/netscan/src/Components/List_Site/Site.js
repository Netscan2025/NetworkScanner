import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './Site.css';
import Navbar from '../Nav_bar/Navbar';
import Breadcrum from '../Breadcrum/Breadcrum';
import Footer from '../Footer/Footer'
import search_w from '../Assets/search-w.png';
import search_d from '../Assets/search-b.png';
import edit_b from '../Assets/editing.png';
import delete_b from '../Assets/delete.png';
import new_b from '../Assets/New.png';
import axios from 'axios';
import Global_Alert from '../Global_Alert/Global_Alert';



const Site = () => {

    const navigate = useNavigate();
    const conf = require ('../../backend');
    const cur_theme = localStorage.getItem('cur_theme');
    const [theme,settheme] = useState(cur_theme? cur_theme : 'light');
    useEffect(()=>{
        localStorage.setItem('cur_theme', theme)
    },[theme])

    const cur_alert = localStorage.getItem('cur_alert');

    const [sites, setsite] = useState([]);

    useEffect(()=>{
        axios.get(`${conf}/sites`)
        .then(res => {
            setsite(res.data.data);
        })
        .catch(err => console.log(err))
    },[]);

    function delete_site(id){
        axios.delete(`${conf}/site/${id}`)
        .then(res => {
            console.log(res)
            if (res.ok){
                navigate('/Dashboard');
            }
        })
        .catch(err => console.log(err));
    }

    return (
        <div className={`container ${theme}`}>
            {cur_alert && <Global_Alert/>}

            <Navbar theme={theme} settheme={settheme}/>
            <Breadcrum/>
            <div className='site-list'>
                <h2 className='site-list-header'>Sites</h2>
                <div className='new-site'>
                    <img onClick={() => navigate('/Site/new')} src={new_b} alt=''/>
                </div>
                <div className='site-filter'>
                    <input type='text' placeholder='Filter Site - Start typing here'/>
                    <img src={theme === 'light' ? search_d : search_w} alt=''/>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Site Name</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Description</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sites.length > 0 ? (sites.map((site) =>(
                            <tr key={site.id}>
                                <td>{site.site_name}</td>
                                <td>{site.site_type}</td>
                                <td>{site.site_status}</td>
                                <td>{site.site_description}</td>
                                <td>
                                    <img onClick={()=> navigate(`/Site/Edit/${site.id}`)} src={edit_b} alt='' className='edit-button'/>
                                    <img onClick={()=>{delete_site(site.id)}} src={delete_b} alt='' className='edit-button'/>
                                </td>
                            </tr>))) : (<tr className='no-site'>
                                <td colSpan={5} rowSpan={2}>
                                    No sites available - Please click on "New" to create a new site!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <Footer/>
        </div>
    )
}

export default Site;