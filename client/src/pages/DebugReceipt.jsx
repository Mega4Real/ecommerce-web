import React, { useState } from 'react';
import ReceiptModal from '../components/ReceiptModal';

const DebugReceipt = () => {
  const [isOpen, setIsOpen] = useState(true);
  
  const sampleOrder = {
    id: 999,
    order_number: "DEBUG123456",
    customer_name: "Debug User",
    customer_email: "debug@example.com",
    customer_phone: "0123456789",
    shipping_address: "123 Debug Lane",
    shipping_city: "Debug City",
    shipping_region: "Debug Region",
    total: "150.00",
    payment_method: "paystack",
    created_at: new Date().toISOString(),
    items: [
      {
        name: "Debug Item 1",
        quantity: 1,
        price: 50.00,
        image: "",
        size: "M"
      },
      {
        name: "Debug Item 2",
        quantity: 2,
        price: 50.00,
        image: "",
        size: "L"
      }
    ]
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Debug Receipt Modal</h1>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      <ReceiptModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        order={sampleOrder} 
      />
    </div>
  );
};

export default DebugReceipt;
