import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Camera } from 'lucide-react';
import './Footer.css';

const TikTokIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.525 0C13.345 0 14 0.655 14 1.475V8.025C14 8.845 14.655 9.5 15.475 9.5C16.295 9.5 16.95 8.845 16.95 8.025V2.95C16.95 1.325 18.275 0 19.9 0C21.525 0 22.85 1.325 22.85 2.95V11.475C22.85 13.1 21.525 14.425 19.9 14.425C18.275 14.425 16.95 13.1 16.95 11.475V10.5C16.95 9.675 16.295 9.025 15.475 9.025C14.655 9.025 14 9.675 14 10.5V16.625C14 18.25 12.675 19.575 11.05 19.575C9.425 19.575 8.1 18.25 8.1 16.625V8.1C8.1 6.475 9.425 5.15 11.05 5.15C12.675 5.15 14 6.475 14 8.1V9.5C14 10.32 14.655 10.975 15.475 10.975C16.295 10.975 16.95 10.32 16.95 9.5V8.025C16.95 6.4 18.275 5.075 19.9 5.075C21.525 5.075 22.85 6.4 22.85 8.025V16.625C22.85 18.25 21.525 19.575 19.9 19.575C18.275 19.575 16.95 18.25 16.95 16.625V15.475C16.95 14.655 16.295 14 15.475 14C14.655 14 14 14.655 14 15.475V21.525C14 22.345 13.345 23 12.525 23C11.705 23 11.05 22.345 11.05 21.525V15.475C11.05 14.655 10.395 14 9.575 14C8.755 14 8.1 14.655 8.1 15.475V21.525C8.1 22.345 7.445 23 6.625 23C5.805 23 5.15 22.345 5.15 21.525V15.475C5.15 14.655 4.495 14 3.675 14C2.855 14 2.2 14.655 2.2 15.475V21.525C2.2 22.345 1.545 23 0.725 23C-0.095 23 -0.75 22.345 -0.75 21.525V9.5C-0.75 7.875 0.575 6.55 2.2 6.55C3.825 6.55 5.15 7.875 5.15 9.5V16.625C5.15 18.25 3.825 19.575 2.2 19.575C0.575 19.575 -0.75 18.25 -0.75 16.625V8.1C-0.75 6.475 0.575 5.15 2.2 5.15C3.825 5.15 5.15 6.475 5.15 8.1V9.5C5.15 10.32 5.805 10.975 6.625 10.975C7.445 10.975 8.1 10.32 8.1 9.5V8.025C8.1 6.4 9.425 5.075 11.05 5.075C12.675 5.075 14 6.4 14 8.025V9.5Z"
      fill="currentColor"
    />
  </svg>
);

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>E-Commerce Store</h3>
          <p>Your one-stop shop for quality products.</p>
          <h4>Follow Us</h4>
          <div className="social-links">
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <Facebook size={20} />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram size={20} />
            </a>
            <a href="https://www.snapchat.com" target="_blank" rel="noopener noreferrer" aria-label="Snapchat">
              <Camera size={20} />
            </a>
            <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <TikTokIcon size={20} />
            </a>
          </div>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/style-diary">Style Diary</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Customer Service</h4>
          <ul>
            <li><Link to="/shipping-returns">Shipping & Returns</Link></li>
            <li><Link to="/size-guide">Size Guide</Link></li>
            <li><Link to="/faqs">FAQs</Link></li>
            <li><Link to="/track-order">Track Order</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Legal</h4>
          <ul>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/terms-of-service">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 E-Commerce Store. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
