import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import ReceiptModal from '../components/ReceiptModal';
import './Receipt.css';

const Receipt = () => {
  const { orderNumber } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`${API_URL}/api/orders/track/${orderNumber}?email=${encodeURIComponent(email)}`);
        if (!response.ok) {
          throw new Error('Order not found or access denied');
        }
        const data = await response.json();
        
        // Ensure items is an array
        if (data.items && typeof data.items === 'string') {
          data.items = JSON.parse(data.items);
        }
        if (!Array.isArray(data.items)) {
           data.items = data.items ? [data.items] : [];
        }
        
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber && email) {
      fetchOrder();
    } else {
      setError('Missing order number or email');
      setLoading(false);
    }
  }, [orderNumber, email]);

  const handleClose = () => {
      navigate('/');
  };

  if (loading) return <div className="receipt-loading">Loading Receipt...</div>;
  if (error) return <div className="receipt-error">Error: {error}</div>;

  return (
    <ReceiptModal isOpen={true} onClose={handleClose} order={order} />
  );
};

export default Receipt;
