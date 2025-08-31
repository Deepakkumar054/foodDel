import React, { useContext, useState } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import { HashLink } from 'react-router-hash-link'
import { StoreContext } from '../../context/StoreContext'

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("Home")
  const { getTotalCartAmount, token, setToken } = useContext(StoreContext)
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem("token")
    setToken("")
    navigate("/")
  }


  return (
    <div className='navbar'>
      <Link to="/"><img src={assets.logo} alt="" className='logo' /></Link>

      <ul className="navbar-menu">
        <Link to="/" onClick={() => setMenu("Home")} className={menu === "Home" ? "active" : ""}>Home</Link>

        <HashLink smooth to="/#explore-menu" onClick={() => setMenu("Menu")} className={menu === "Menu" ? "active" : ""}>
          Menu
        </HashLink>

        <HashLink smooth to="/#app-download" onClick={() => setMenu("Mobile-app")} className={menu === "Mobile-app" ? "active" : ""}>
          Mobile-app
        </HashLink>

        <HashLink smooth to="/#footer" onClick={() => setMenu("Contact us")} className={menu === "Contact us" ? "active" : ""}>
          Contact us
        </HashLink>
      </ul>

      <div className="navbar-right">
        <img src={assets.search_icon} alt="" />
        <div className="navbar-search-icon">
          <Link to="/cart"><img src={assets.basket_icon} alt="" /></Link>
          <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
        </div>

        {
          !token
            ? <button onClick={() => setShowLogin(true)}>sign in</button>
            : <div className='navbar-profile'>
                <img src={assets.profile_icon} alt="" />
                <ul className="nav-profile-dropdown">
                  <li onClick={()=>navigate('/myorders')}>
                    <img src={assets.bag_icon} alt="" /><p>Orders</p>
                  </li>
                  <hr />
                  <li onClick={logout}><img src={assets.logout_icon} alt="" /><p>Logout</p></li>
                </ul>
              </div>
        }
      </div>
    </div>
  )
}

export default Navbar
