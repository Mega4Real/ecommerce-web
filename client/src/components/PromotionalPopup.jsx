import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsContext } from '../contexts/SettingsContext';
import { X } from 'lucide-react';
import './PromotionalPopup.css';

const PromotionalPopup = () => {
  const { settings, loading } = useContext(SettingsContext);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !settings.popup_enabled) return;

    // Check if it should show based on session storage
    if (settings.popup_show_once) {
      const hasSeenPopup = sessionStorage.getItem('has_seen_promo_popup');
      if (hasSeenPopup) return;
    }

    const timer = setTimeout(() => {
      setShouldRender(true);
      // Small delay to trigger animation
      setTimeout(() => setIsVisible(true), 50);
    }, (settings.popup_delay * 1000) || 3000);

    return () => clearTimeout(timer);
  }, [loading, settings.popup_enabled, settings.popup_delay, settings.popup_show_once]);

  const handleClose = () => {
    setIsVisible(false);
    if (settings.popup_show_once) {
      sessionStorage.setItem('has_seen_promo_popup', 'true');
    }
    // Remove from DOM after transition
    setTimeout(() => setShouldRender(false), 500);
  };

  const handleAction = () => {
    handleClose();
    if (settings.popup_button_link) {
      if (settings.popup_button_link.startsWith('http')) {
        window.open(settings.popup_button_link, '_blank');
      } else {
        navigate(settings.popup_button_link);
      }
    }
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!settings.popup_coupon_code) return;
    
    navigator.clipboard.writeText(settings.popup_coupon_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!shouldRender || !settings.popup_enabled) return null;

  return (
    <div className={`promo-popup-overlay ${isVisible ? 'active' : ''}`} onClick={handleClose}>
      <div className="promo-popup-container" onClick={(e) => e.stopPropagation()}>
        <button className="promo-close-btn" onClick={handleClose} aria-label="Close popup">
          <X size={18} />
        </button>
        
        <div className="promo-popup-content">
          <h2>{settings.popup_title}</h2>
          {settings.popup_message && <p className="promo-message">{settings.popup_message}</p>}
          
          {settings.popup_coupon_code && (
            <div 
              className={`promo-coupon-box ${copied ? 'copied' : ''}`} 
              onClick={handleCopy}
              title="Click to copy"
            >
              <span className="promo-coupon-code">{settings.popup_coupon_code}</span>
              <span className="promo-copy-feedback">{copied ? 'Copied!' : 'Click to copy'}</span>
            </div>
          )}
          
          <div className="promo-actions">
            <button className="promo-main-btn" onClick={handleAction}>
              {settings.popup_button_text || 'Shop Now'}
            </button>
            <button className="promo-no-thanks" onClick={handleClose}>
              No thanks, I'll browse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionalPopup;
