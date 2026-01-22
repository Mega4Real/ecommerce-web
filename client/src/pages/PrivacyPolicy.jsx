import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy">
      <div className="privacy-header">
        <h1>Privacy Policy</h1>
        <p>Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.</p>
      </div>
      <div className="privacy-content">
        <div className="text-section">
          <h2>Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.</p>
          <h3>Personal Information</h3>
          <ul>
            <li>Name, email address, and phone number</li>
            <li>Billing and shipping addresses</li>
            <li>Payment information (processed securely by third-party providers)</li>
            <li>Account credentials and preferences</li>
          </ul>
          <h3>Automatically Collected Information</h3>
          <ul>
            <li>IP address and location data</li>
            <li>Browser type and version</li>
            <li>Pages visited and time spent on our site</li>
            <li>Device information and cookies</li>
          </ul>
        </div>
        <div className="text-section">
          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services.</p>
          <ul>
            <li>Process and fulfill your orders</li>
            <li>Communicate with you about your account and orders</li>
            <li>Send marketing communications (with your consent)</li>
            <li>Improve our website and customer experience</li>
            <li>Prevent fraud and ensure security</li>
            <li>Comply with legal obligations</li>
          </ul>
        </div>
        <div className="text-section">
          <h2>Information Sharing</h2>
          <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
          <ul>
            <li>With service providers who help us operate our business</li>
            <li>To comply with legal requirements</li>
            <li>To protect our rights and prevent fraud</li>
            <li>With your explicit consent</li>
          </ul>
        </div>
        <div className="text-section">
          <h2>Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
          <ul>
            <li>SSL encryption for data transmission</li>
            <li>Secure payment processing</li>
            <li>Regular security audits and updates</li>
            <li>Limited access to personal information</li>
          </ul>
        </div>
        <div className="text-section">
          <h2>Cookies and Tracking</h2>
          <p>We use cookies and similar technologies to enhance your browsing experience and analyze site traffic.</p>
          <ul>
            <li>Essential cookies for site functionality</li>
            <li>Analytics cookies to understand user behavior</li>
            <li>Marketing cookies for personalized advertising</li>
          </ul>
          <p>You can control cookie preferences through your browser settings.</p>
        </div>
        <div className="text-section">
          <h2>Your Rights</h2>
          <p>You have the right to access, update, or delete your personal information. You may also opt out of marketing communications.</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict processing</li>
            <li>Data portability</li>
          </ul>
        </div>
        <div className="text-section">
          <h2>Children's Privacy</h2>
          <p>Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
        </div>
        <div className="text-section">
          <h2>Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. We will notify you of any material changes by email or through our website.</p>
        </div>
        <div className="text-section">
          <h2>Contact Us</h2>
          <p>If you have any questions about this privacy policy, please contact us at privacy@yourstore.com or through our contact page.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
