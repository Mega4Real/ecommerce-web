import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Phone } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext.js';
import './Footer.css';

const WhatsAppIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.559 4.189 1.615 6.007L0 24l6.111-1.604a11.75 11.75 0 005.932 1.609h.005c6.632 0 12.028-5.395 12.031-12.028a11.75 11.75 0 00-3.528-8.503z" />
  </svg>
);

const TikTokIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.6-4.12-1.31a6.34 6.34 0 01-1.87-1.63v7.49c.04 1.83-.44 3.72-1.61 5.14-1.29 1.58-3.4 2.45-5.43 2.32-2.15-.14-4.22-1.41-5.26-3.3-1.12-2.03-1-4.73.4-6.52 1.19-1.52 3.12-2.38 5.05-2.2v4.03c-1.14-.07-2.35.45-2.95 1.43-.65 1.05-.51 2.53.35 3.42.84.86 2.21 1.03 3.19.4a2.95 2.95 0 001.32-2.47V.02z" />
  </svg>
);

const Footer = () => {
  const { settings } = useSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>LUXE.CO</h3>
          <p>Elevating your style with timeless pieces and modern aesthetics.</p>
          <h4>Follow Us</h4>
          <div className="social-links">
            {settings.social_whatsapp && (
              <a href={settings.social_whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <WhatsAppIcon size={20} />
              </a>
            )}
            {settings.social_instagram && (
              <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram size={20} />
              </a>
            )}
            {settings.social_tiktok && (
              <a href={settings.social_tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <TikTokIcon size={20} />
              </a>
            )}
            {settings.social_phone && (
              <a href={settings.social_phone} aria-label="Phone">
                <Phone size={20} />
              </a>
            )}
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
        <p>&copy; {year} {settings.store_name}. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
