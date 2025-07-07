import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router, Routes, Route, Navigate, Link} from 'react-router-dom'
import LoginSignup from './Components/LoginSignup/LoginSignup';
import Site from './Components/List_Site/Site';
import New_Site from './Components/List_Site/Subpages/New_Site';
import Admin from './Components/Admin_page/Admin';
import Dashboard from './Components/Dashboard_page/Dashboard';
import About from './Components/About/About';
import Settings from './Components/Admin_page/Subpages_Settings/Settings';
import All_devices from './Components/Admin_page/Subpages_Alldevice/All_devices';
import User from './Components/Admin_page/Subpages_UM/User';
import Integrations from './Components/Admin_page/Subpages_Integration/Integrations';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path='/' element={<LoginSignup/>} />
        <Route path='/Site' element={<Site/>}/>
        <Route path='/Admin' element={<Admin/>}/>
        <Route path='/Dashboard' element={<Dashboard/>}/>
        <Route path='/About' element={<About/>}/>
        <Route path='/Site/New' element={<New_Site/>}/>
        <Route path='/Admin/Settings' element={<Settings/>}/>
        <Route path='/Admin/All_Devices' element={<All_devices/>}/>
        <Route path='/Admin/User_Management' element={<User/>}/>
        <Route path='/Admin/Integration' element={<Integrations/>}/>
        <Route path='*' element={<Navigate to="/"/>} />
      </Routes>
    </Router>
  </React.StrictMode>
);




// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
