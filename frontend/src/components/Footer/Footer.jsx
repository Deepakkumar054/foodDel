import React from 'react'
import './Footer.css';
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
        <div className="footer-content">
            <div className="footer-content-left">
                <img className='logo' src={assets.logo} alt="" />
                <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Adipisci error provident, fuga iure sed impedit magnam. Vero sunt necessitatibus blanditiis dolore, officia nam consequatur exercitationem.</p>
                <div className="footer-social-icons">
                    <img src={assets.facebook_icon} alt="" />
                    <img src={assets.twitter_icon} alt="" />
                    <img src={assets.linkedin_icon} alt="" />
                </div>

            </div>
            <div className="footer-content-center">
                <h2>COMPANY</h2>
                <ul>
                    <li>Home</li>
                    <li>About us</li>
                    <li>Delivery</li>
                    <li>Privacy&Policy</li>
                </ul>
            </div>
            <div className="footer-content-right">
                <h2>GET IN TOUCH</h2>
                <ul>
                    <li>+91 800-384-2000</li>
                    <li>contact@foodzio.com</li>
                </ul>
            </div>
        </div>
        <hr />
        <p className="footer-copyright">
            copyright 2025 @ FoodZio.com - All rights reserved.
        </p>

    </div>
  )
}

export default Footer