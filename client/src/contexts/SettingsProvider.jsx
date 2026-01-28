import { useState, useEffect } from 'react';
import { SettingsContext } from './SettingsContext';
import { API_URL } from '../config';

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    store_name: 'LUXE.CO',
    contact_email: '',
    contact_phone: '',
    address: '',
    currency: 'GHS',
    announcement_bar_enabled: false,
    announcement_text: '',
    social_facebook: '',
    social_instagram: '',
    social_twitter: '',
    social_snapchat: '',
    social_tiktok: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/api/settings`);
        if (response.ok) {
          const data = await response.json();
          // Ensure all expected fields are present even if null from DB
          const completeData = {
            store_name: 'LUXE.CO',
            contact_email: 'hello@Luxe.com',
            contact_phone: '+233 23 456 7890',
            address: 'East Legon. Bawaleshie Road.',
            currency: data.currency || 'GHS',
            announcement_bar_enabled: data.announcement_bar_enabled !== undefined ? data.announcement_bar_enabled : true,
            announcement_text: data.announcement_text || '',
            social_instagram: 'https://instagram.com/luxe.co',
            social_tiktok: 'https://tiktok.com/@luxe.co',
            social_whatsapp: 'https://wa.me/233234567890',
            social_phone: 'tel:+233234567890'
          };
          setSettings(completeData);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};
