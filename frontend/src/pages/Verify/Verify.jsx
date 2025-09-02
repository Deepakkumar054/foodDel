import React, { useContext, useEffect } from 'react'
import './Verify.css'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const Verify = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success');
  const orderId = searchParams.get('orderId');
  const { url } = useContext(StoreContext);

  const navigate = useNavigate();

  const verifyPayment = async () => {
    try {
      const token = localStorage.getItem("token"); // 👈 get token
      const response = await axios.post(
        url + '/api/order/verify',
        { success, orderId },
        { headers: { token } } // 👈 send token in headers
      );

      if (response.data.success) {
        navigate("/myorders");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("❌ Verification failed:", error);
      navigate("/");
    }
  };

  useEffect(() => {
    verifyPayment();
    // eslint-disable-next-line
  }, []);

  return (
    <div className='verify'>
      <div className="spinner"></div>
    </div>
  );
}

export default Verify;
