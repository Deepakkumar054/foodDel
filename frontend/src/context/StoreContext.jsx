import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState({});
  const [food_list, setFoodList] = useState([]);
  const [token, setToken] = useState("");
  const url = import.meta.env.VITE_API_URL;

  const loadCartData = async (tok) => {
    try {
      const res = await axios.get(`${url}/api/cart/get`, { headers: { token: tok } });
      if (res.data.success) setCartItems(res.data.cartData);
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = async (itemId) => {
    if (!token) return;
    try {
      const res = await axios.post(`${url}/api/cart/add`, { itemId }, { headers: { token } });
      if (res.data.success) setCartItems(res.data.cartData);
    } catch (err) {
      console.error(err);
    }
  };

  const removeFromCart = async (itemId) => {
    if (!token) return;
    try {
      const res = await axios.post(`${url}/api/cart/remove`, { itemId }, { headers: { token } });
      if (res.data.success) setCartItems(res.data.cartData);
    } catch (err) {
      console.error(err);
    }
  };

  const getTotalCartAmount = () => {
    let total = 0;
    for (const id in cartItems) {
      const itemInfo = food_list.find(f => f._id === id);
      if (itemInfo) total += itemInfo.price * cartItems[id];
    }
    return total;
  };

  const fetchFoodList = async () => {
    try {
      const res = await axios.get(`${url}/api/food/list`);
      setFoodList(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      loadCartData(savedToken);
    }
    fetchFoodList();
  }, []);

  useEffect(() => { if (token) loadCartData(token); }, [token]);

  return (
    <StoreContext.Provider value={{
      cartItems, setCartItems, food_list, addToCart, removeFromCart,
      getTotalCartAmount, url, token, setToken
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
