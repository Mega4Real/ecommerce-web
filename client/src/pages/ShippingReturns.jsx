import React from 'react';
import './ShippingReturns.css';

const ShippingReturns = () => {
  return (
    <div className="shipping-returns">
      <div className="shipping-header">
        <h1>Shipping & Returns</h1>
        <p>Everything you need to know about our shipping and return policies to ensure a smooth shopping experience.</p>
      </div>
      <div className="shipping-content">
        <div className="shipping-section">
          <h2>Shipping Information</h2>
          <p>We are committed to delivering your orders quickly and securely. All orders are processed within 1-2 business days after payment confirmation.</p>
          <h3>Shipping Rates</h3>
          <ul>
            <li><strong>Free Standard Shipping:</strong> On all orders over GH₵1000</li>
            <li><strong>Standard Shipping:</strong> GH₵50 - 5-7 business days</li>
            <li><strong>Express Shipping:</strong> GH₵100 - 2-3 business days</li>
            <li><strong>Same Day Delivery:</strong> GH₵150 - Available in Accra only, order before 12pm</li>
          </ul>
          <h3>International Shipping</h3>
          <p>We offer international shipping to select countries. Rates and delivery times vary by location. Contact us for a quote.</p>
        </div>
        <div className="shipping-section">
          <h2>Returns Policy</h2>
          <p>Your satisfaction is our priority. We accept returns within 30 days of delivery for a full refund or exchange.</p>
          <h3>Return Conditions</h3>
          <ul>
            <li>Items must be unworn, unwashed, and with original tags attached</li>
            <li>Original packaging and accessories must be included</li>
            <li>Sale items are final sale and cannot be returned</li>
            <li>Custom or personalized items cannot be returned</li>
          </ul>
          <h3>How to Return</h3>
          <ol>
            <li>Contact our customer service team to initiate a return</li>
            <li>Receive a return authorization number</li>
            <li>Pack the item securely in its original packaging</li>
            <li>Ship to the provided return address</li>
          </ol>
          <p>Refunds will be processed within 5-7 business days after we receive the returned item. Shipping costs are non-refundable unless the item was defective.</p>
        </div>
        <div className="shipping-section">
          <h2>Exchanges</h2>
          <p>We offer exchanges for a different size, color, or style within 30 days of delivery. Exchanges are subject to availability and follow the same conditions as returns.</p>
        </div>
        <div className="shipping-section">
          <h2>Damaged or Defective Items</h2>
          <p>If you receive a damaged or defective item, please contact us immediately. We will arrange for a replacement or full refund at no cost to you.</p>
        </div>
      </div>
    </div>
  );
};

export default ShippingReturns;
