import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="contact-page container section">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you. Our team is here to help with any questions.</p>
      </div>

      <div className="contact-content">
        <div className="contact-form-section">
          <h2>Send Us a Message</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="Your first name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Your last name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                placeholder="How can we help?"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                placeholder="Tell us more about your inquiry..."
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <button type="submit" className="btn-submit">Send Message</button>
          </form>
        </div>

        <div className="contact-details-section">
          <h2>Get in Touch</h2>
          <div className="contact-details">
            <div className="contact-item">
              <MapPin className="contact-item-icon" />
              <div className="contact-item-content">
                <h3>Visit Our Boutique</h3>
                <p>East Legon. Bawaleshie Road.</p>
              </div>
            </div>
            <div className="contact-item">
              <Phone className="contact-item-icon" />
              <div className="contact-item-content">
                <h3>Call Us</h3>
                <p>+233 23 456 7890</p>
              </div>
            </div>
            <div className="contact-item">
              <Mail className="contact-item-icon" />
              <div className="contact-item-content">
                <h3>Email Us</h3>
                <p>hello@Luxe.com</p>
              </div>
            </div>
            <div className="contact-item">
              <Clock className="contact-item-icon" />
              <div className="contact-item-content">
                <h3>Store Hours</h3>
                <p>Monday - Saturday: 10am - 8pm<br />Sunday: 11am - 6pm</p>
              </div>
            </div>
          </div>
          <div className="map-placeholder">
            Map coming soon
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
