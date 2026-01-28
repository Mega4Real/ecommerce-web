import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Plus, Save, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react';
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
    social_tiktok: 'https://tiktok.com/@luxe.co',
    popup_enabled: false,
    popup_title: 'Special Offer!',
    popup_message: '',
    popup_coupon_code: 'WELCOME20',
    popup_button_text: 'Shop Now',
    popup_button_link: '/shop',
    popup_delay: 3,
    popup_show_once: true
  });
  
  const [showPopupPreview, setShowPopupPreview] = useState(false);
  const [popupCopied, setPopupCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [discounts, setDiscounts] = useState([]);
  const [newDiscount, setNewDiscount] = useState({
    code: '',
    type: 'percentage',
    value: '',
    min_quantity: 0,
    usage_limit: ''
  });
  const [showAddDiscount, setShowAddDiscount] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchDiscounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchDiscounts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/discounts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDiscounts(data);
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
    }
  };

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
    } catch {
      setMessage({ type: 'error', text: 'Failed to save settings' });
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

  const handleAddDiscount = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/discounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newDiscount)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Discount code added!' });
        setNewDiscount({ code: '', type: 'percentage', value: '', min_quantity: 0, usage_limit: '' });
        setShowAddDiscount(false);
        fetchDiscounts();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to add discount' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred' });
    }
  };

  const toggleDiscountStatus = async (id, currentStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/discounts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (response.ok) fetchDiscounts();
    } catch {
      console.error('Error toggling status');
    }
  };

  const deleteDiscount = async (id) => {
    if (!window.confirm('Are you sure you want to delete this discount code?')) return;
    try {
      const response = await fetch(`${API_URL}/api/discounts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchDiscounts();
    } catch {
      console.error('Error deleting discount');
    }
  };

  const handlePreviewCopy = () => {
    if (!settings.popup_coupon_code) return;
    navigator.clipboard.writeText(settings.popup_coupon_code);
    setPopupCopied(true);
    setTimeout(() => setPopupCopied(false), 2000);
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

        <div className="settings-card full-width" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3>Discount Codes</h3>
            <button type="button" className="add-btn" onClick={() => setShowAddDiscount(!showAddDiscount)}>
              {showAddDiscount ? (
                <><X size={16} style={{ marginRight: '8px' }} /> Cancel</>
              ) : (
                <><Plus size={16} style={{ marginRight: '8px' }} /> Add New Code</>
              )}
            </button>
          </div>

          {showAddDiscount && (
            <div className="add-discount-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Code</label>
                  <input 
                    type="text" 
                    placeholder="SAVE10" 
                    value={newDiscount.code} 
                    onChange={(e) => setNewDiscount({...newDiscount, code: e.target.value.toUpperCase()})}
                  />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select value={newDiscount.type} onChange={(e) => setNewDiscount({...newDiscount, type: e.target.value})}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₵)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Value</label>
                  <input 
                    type="number" 
                    placeholder="10" 
                    value={newDiscount.value} 
                    onChange={(e) => setNewDiscount({...newDiscount, value: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Min. Quantity (Items)</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={newDiscount.min_quantity} 
                    onChange={(e) => setNewDiscount({...newDiscount, min_quantity: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Usage Limit</label>
                  <input 
                    type="number" 
                    placeholder="No limit" 
                    value={newDiscount.usage_limit} 
                    onChange={(e) => setNewDiscount({...newDiscount, usage_limit: e.target.value})}
                  />
                </div>
              </div>
              <button type="button" className="btn-save-discount" onClick={handleAddDiscount}>
                <Save size={18} style={{ marginRight: '10px' }} /> Save Discount Code
              </button>
            </div>
          )}

          <div className="discounts-list">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Min. Qty</th>
                  <th>Limit</th>
                  <th>Used</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {discounts.length === 0 ? (
                  <tr><td colSpan="8" className="empty-state">No discount codes found</td></tr>
                ) : (
                  discounts.map(d => (
                    <tr key={d.id}>
                      <td><strong>{d.code}</strong></td>
                      <td>{d.type.charAt(0).toUpperCase() + d.type.slice(1)}</td>
                      <td>{d.type === 'percentage' ? `${d.value}%` : `₵${d.value}`}</td>
                      <td>{d.min_quantity}</td>
                      <td>{d.usage_limit || '∞'}</td>
                      <td>{d.used_count}</td>
                      <td>
                        <span className={`status-badge ${d.is_active ? 'active' : 'inactive'}`}>
                          {d.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="actions">
                        <button type="button" className="btn-toggle" onClick={() => toggleDiscountStatus(d.id, d.is_active)}>
                          {d.is_active ? (
                            <><ToggleRight size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Deactivate</>
                          ) : (
                            <><ToggleLeft size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Activate</>
                          )}
                        </button>
                        <button type="button" className="btn-delete" onClick={() => deleteDiscount(d.id)}>
                          <Trash2 size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="settings-grid">
            <div className="settings-card full-width">
              <div className="card-header">
                <h3>Promotional Popup</h3>
                <div className="header-actions">
                  <button 
                    type="button" 
                    className="preview-btn" 
                    onClick={() => setShowPopupPreview(true)}
                  >
                    Preview Popup
                  </button>
                </div>
              </div>
              
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="popup_enabled"
                    checked={settings.popup_enabled}
                    onChange={handleChange}
                  />
                  Enable Promotional Popup
                </label>
              </div>

              <div className="settings-grid">
                <div className="form-group full-width">
                  <label>Popup Title</label>
                  <input
                    type="text"
                    name="popup_title"
                    value={settings.popup_title}
                    onChange={handleChange}
                    placeholder="e.g. Special Offer!"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Popup Message (Optional)</label>
                  <textarea
                    name="popup_message"
                    value={settings.popup_message}
                    onChange={handleChange}
                    placeholder="Additional details about the offer..."
                    rows="2"
                  />
                </div>
                <div className="form-group">
                  <label>Coupon Code</label>
                  <input
                    type="text"
                    name="popup_coupon_code"
                    value={settings.popup_coupon_code}
                    onChange={handleChange}
                    placeholder="WELCOME20"
                  />
                </div>
                <div className="form-group">
                  <label>Button Text</label>
                  <input
                    type="text"
                    name="popup_button_text"
                    value={settings.popup_button_text}
                    onChange={handleChange}
                    placeholder="Shop Now"
                  />
                </div>
                <div className="form-group">
                  <label>Button Link</label>
                  <input
                    type="text"
                    name="popup_button_link"
                    value={settings.popup_button_link}
                    onChange={handleChange}
                    placeholder="/shop"
                  />
                </div>
                <div className="form-group">
                  <label>Display Delay (seconds)</label>
                  <input
                    type="number"
                    name="popup_delay"
                    value={settings.popup_delay}
                    onChange={handleChange}
                    step="1"
                    min="0"
                    placeholder="3"
                  />
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="popup_show_once"
                      checked={settings.popup_show_once}
                      onChange={handleChange}
                    />
                    Show only once per session
                  </label>
                </div>
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
          </div>

          <div className="form-actions">
            <button type="submit" className="save-button" disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      {showPopupPreview && (
        <div className="popup-preview-overlay">
          <div className="popup-preview-container">
            <button className="preview-close" onClick={() => setShowPopupPreview(false)}>×</button>
            <div className="popup-preview-content">
              <h2>{settings.popup_title}</h2>
              {settings.popup_message && <p className="preview-message">{settings.popup_message}</p>}
              {settings.popup_coupon_code && (
                <div 
                  className={`preview-coupon ${popupCopied ? 'copied' : ''}`} 
                  onClick={handlePreviewCopy}
                  style={{ cursor: 'pointer' }}
                  title="Click to copy"
                >
                  <span>{popupCopied ? 'Copied!' : 'Code:'}</span>
                  <strong>{settings.popup_coupon_code}</strong>
                </div>
              )}
              <div className="preview-actions">
                <button className="preview-main-btn">{settings.popup_button_text}</button>
                <button className="preview-secondary-btn" onClick={() => setShowPopupPreview(false)}>No thanks</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
