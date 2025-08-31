import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [food_list, setFoodList] = useState([]);
  const [token, setToken] = useState("");
  const url = "http://localhost:5000";

  // 📦 Load cart from backend
  const loadCartData = async (tok) => {
    try {
      // console.log("🔑 Loading cart with token:", tok);
      const response = await axios.get(`${url}/api/cart/get`, {
        headers: { token: tok },
      });

      if (response.data.success) {
        setCartItems(response.data.cartData);
        // console.log("✅ Cart set:", response.data.cartData);
      }
    } catch (error) {
      console.error("❌ Error fetching cart:", error.response?.data || error.message);
    }
  };

  // ➕ Add item
  const addToCart = async (itemId) => {
    if (token) {
      try {
        const response = await axios.post(
          url + "/api/cart/add",
          { itemId },
          { headers: { token } }
        );

        if (response.data.success) {
          setCartItems(response.data.cartData); // ✅ trust DB
        }
      } catch (err) {
        console.error("Error adding item:", err);
      }
    }
  };

  // ➖ Remove item
  const removeFromCart = async (itemId) => {
    if (token) {
      try {
        const response = await axios.post(
          url + "/api/cart/remove",
          { itemId },
          { headers: { token } }
        );

        if (response.data.success) {
          setCartItems(response.data.cartData); // ✅ trust DB
        }
      } catch (err) {
        console.error("Error removing item:", err);
      }
    }
  };

  // 💰 Get total cart value
  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((product) => product._id === item);
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  // 🍔 Fetch food list
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(url + "/api/food/list");
      setFoodList(response.data.data);
    } catch (err) {
      console.error("Error fetching food list:", err);
    }
  };

  // 🚀 On app start
  useEffect(() => {
    async function loadData() {
      await fetchFoodList();

      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
        await loadCartData(savedToken);
      } else {
        setCartItems({});
      }
    }
    loadData();
  }, []);

  // 🔄 Whenever token changes, reload cart
  useEffect(() => {
    if (token) loadCartData(token);
  }, [token]);

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
    loadCartData,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
