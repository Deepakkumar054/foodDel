import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import './PlaceOrder.css';

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url } = useContext(StoreContext);
  const navigate = useNavigate();

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: ""
  });

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const placeOrder = async (e) => {
    e.preventDefault();

    if (!token) return navigate('/login');

    const orderItems = food_list
      .filter(item => cartItems[item._id] > 0)
      .map(item => ({ ...item, quantity: cartItems[item._id] }));

    if (orderItems.length === 0) return alert("Cart is empty");

    const orderData = {
      address: data,
      items: orderItems,
      amount: getTotalCartAmount() + 2 // add delivery fee
    };

    try {
      const response = await axios.post(`${url}/api/order/place`, orderData, { headers: { token } });
      if (response.data.success) {
        window.location.href = response.data.session_url; // redirect to Stripe
      }
    } catch (err) {
      console.error("Order placement failed:", err);
      alert("Failed to place order. Try again.");
    }
  };

  useEffect(() => {
    if (!token || getTotalCartAmount() === 0) navigate('/cart');
  }, [token]);

  return (
    <form className="place-order" onSubmit={placeOrder}>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input required name="firstName" value={data.firstName} onChange={onChangeHandler} placeholder="First Name" />
          <input required name="lastName" value={data.lastName} onChange={onChangeHandler} placeholder="Last Name" />
        </div>
        <input required name="email" value={data.email} onChange={onChangeHandler} type="email" placeholder="Email" />
        <input required name="street" value={data.street} onChange={onChangeHandler} placeholder="Street" />
        <div className="multi-fields">
          <input required name="city" value={data.city} onChange={onChangeHandler} placeholder="City" />
          <input required name="state" value={data.state} onChange={onChangeHandler} placeholder="State" />
        </div>
        <div className="multi-fields">
          <input required name="zipcode" value={data.zipcode} onChange={onChangeHandler} placeholder="Zip Code" />
          <input required name="country" value={data.country} onChange={onChangeHandler} placeholder="Country" />
        </div>
        <input required name="phone" value={data.phone} onChange={onChangeHandler} placeholder="Phone" />
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div className="cart-total-details">
            <p>Subtotal</p>
            <p>${getTotalCartAmount()}</p>
          </div>
          <div className="cart-total-details">
            <p>Delivery Fee</p>
            <p>${getTotalCartAmount() === 0 ? 0 : 2}</p>
          </div>
          <div className="cart-total-details">
            <b>Total</b>
            <b>${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
          </div>
          <button type="submit">PROCEED TO PAYMENT</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
