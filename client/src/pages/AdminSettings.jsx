import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import './AdminSettings.css';

const AdminSettings = () => {
  const { token } = useAdminAuth();
  const [settings, setSettings] = useState({
    currency: 'GHS',
    announcement_bar_enabled: true,
    announcement_text: '',
    social_facebook: 'https://facebook.com/luxe.co',
    social_instagram: 'https://instagram.com/luxe.co',
    social_twitter: 'https://twitter.com/luxe.co',
    social_tiktok: 'https://tiktok.com/@luxe.co'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/settings`);
      if (response.ok) {
        const data = await response.json();
        // Remove null values to avoid controlled/uncontrolled input warnings
        const cleanedData = Object.fromEntries(
          Object.entries(data).map(([key, value]) => [key, value === null ? '' : value])
        );
        setSettings(prev => ({ ...prev, ...cleanedData }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_URL}/api/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to update settings' });
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage({ type: 'error', text: 'An error occurred while saving' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-loading">Loading settings...</div>;

  return (
    <div className="admin-section">
      <header className="content-header">
        <h1>Admin Settings</h1>
      </header>

      <div className="admin-settings-container">
        {message.text && (
          <div className={`status-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="settings-grid">

            <div className="settings-card">
              <h3>Payment & Currency</h3>
              <div className="form-group">
                <label>Currency</label>
                <select name="currency" value={settings.currency} onChange={handleChange}>
                  <option value="GHS">GHS (₵)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div className="settings-card">
              <h3>Marketing & Social</h3>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="announcement_bar_enabled"
                    checked={settings.announcement_bar_enabled}
                    onChange={handleChange}
                  />
                  Enable Announcement Bar
                </label>
              </div>
              <div className="form-group">
                <label>Announcement Bar Text</label>
                <input
                  type="text"
                  name="announcement_text"
                  value={settings.announcement_text}
                  onChange={handleChange}
                  placeholder="e.g. Free shipping on orders over ₵500"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-button" disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
