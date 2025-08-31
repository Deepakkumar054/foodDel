import React from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'

const Navbar = () => {
  return (
    <div className='navbar'>
      <div className="logo-wrapper">
        <img className='logo' src={assets.logo} alt="logo" />
        <span className="admin-text">Admin Panel</span>
      </div>
      <img className='profile' src={assets.profile_image} alt="profile" />        
    </div>
  )
}

export default Navbar
