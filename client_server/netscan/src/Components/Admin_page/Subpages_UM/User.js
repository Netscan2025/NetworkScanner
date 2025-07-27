import React from 'react'
import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './User.css';
import Navbar from '../../Nav_bar/Navbar';
import new_b from '../../Assets/New.png';
import Sidebar from '../../Sidebar/Sidebar';
import Footer from '../../Footer/Footer';
import Breadcrum from '../../Breadcrum/Breadcrum';
import edit_b from '../../Assets/editing.png';
import delete_b from '../../Assets/delete.png';
import axios from 'axios';


const User = () => {
    const cur_theme = localStorage.getItem('cur_theme');
    const [theme,settheme] = useState(cur_theme? cur_theme : 'light');
    useEffect(()=>{
        localStorage.setItem('cur_theme', theme)
    },[theme])

    const conf = require ('../../../backend');
    const navigate = useNavigate();
    const [users, setuser] = useState([]);

    useEffect(() => {
      axios.get(`${conf.BES_URL}/user`)
      .then(res => {
        if (res?.data){
          setuser(res.data)
        }
      })
      .catch(err => {console.log(err)})
    })

        function edit_site(user){
        axios.patch(`${conf.BES_URL}/users/${user.id}`,{
            firstname:user.first_name,
            lastname:user.last_name,
            username: user.username,
            email: user.email
        })
        .then(res => {
            console.log(res);
        })
        .catch(err => console.log(err));
    }

    function delete_site(user){
        axios.post(`${conf.BES_URL}/users/${user.id}`,{
            firstname:user.first_name,
            lastname:user.last_name,
            username: user.username,
            email: user.email
        })
        .then(res => {
            console.log(res)
            if (res.ok){
                navigate('/Admin/User_Management');
            }
        })
        .catch(err => console.log(err));
    }

  return (
    <div className={`container ${theme}`}>
      <Navbar theme={theme} settheme={settheme}/>
      <Breadcrum/>
      <div className='user-page'>
        <Sidebar/>
        <div className='user-content'>
          <h2>User</h2>
          <div className='new-site'>
            <img onClick={() => navigate('/Admin/User/New_User')} src={new_b} alt=''/>
          </div>
          <table>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (users.map((user) =>(
              <tr key={user.id}>
                <td>{user.first_name}</td>
                <td>{user.last_name}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.created_at}</td>
                <td>
                  <img onClick={()=>{edit_site()}} src={edit_b} alt='' className='edit-button'/>
                  <img onClick={()=>{delete_site()}} src={delete_b} alt='' className='delete-button'/>
                </td>
            </tr>))) : (<tr className='no-user'>
                      <td colSpan={5} rowSpan={2}>
                        No user - Please click on "New" to create a new user!
                      </td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </div>
      <Footer/>    
    </div>
  )
}

export default User
