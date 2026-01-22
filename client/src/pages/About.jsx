import './About.css';

const About = () => {
  return (
    <div className="container section about-page">
      <div className="about-header">
        <h1>About LUXE.CO</h1>
        <p>Elevating your style with timeless pieces and modern aesthetics.</p>
      </div>

      <div className="about-content">
        <div className="about-section">
          <h2>Our Story</h2>
          <p>
            Founded in 2020, LUXE.CO emerged from a passion for blending classic elegance with contemporary design.
            We believe that fashion should be accessible, sustainable, and empowering. Our journey began in Accra,
            Ghana, with a vision to create a brand that celebrates individuality and cultural diversity.
          </p>
        </div>

        <div className="about-section">
          <h2>Our Mission</h2>
          <p>
            At LUXE.CO, our mission is to provide high-quality, ethically sourced fashion that makes you feel
            confident and stylish. We curate collections that reflect the latest trends while honoring traditional
            craftsmanship and sustainable practices. Every piece in our collection tells a story of innovation,
            quality, and cultural appreciation.
          </p>
        </div>

        <div className="about-section">
          <h2>What Sets Us Apart</h2>
          <ul>
            <li><strong>Quality Craftsmanship:</strong> Each garment is carefully crafted with attention to detail and durability.</li>
            <li><strong>Sustainable Practices:</strong> We prioritize eco-friendly materials and ethical manufacturing processes.</li>
            <li><strong>Cultural Inspiration:</strong> Our designs draw inspiration from diverse cultures and artistic traditions.</li>
            <li><strong>Inclusive Sizing:</strong> We offer a wide range of sizes to ensure fashion is accessible to everyone.</li>
            <li><strong>Customer-Centric:</strong> Your satisfaction is our priority, with dedicated support and hassle-free returns.</li>
          </ul>
        </div>

        <div className="about-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-item">
              <h3>Quality</h3>
              <p>We never compromise on the quality of our products or services.</p>
            </div>
            <div className="value-item">
              <h3>Sustainability</h3>
              <p>Environmental responsibility is at the core of everything we do.</p>
            </div>
            <div className="value-item">
              <h3>Inclusivity</h3>
              <p>Fashion should be for everyone, regardless of size, background, or style.</p>
            </div>
            <div className="value-item">
              <h3>Innovation</h3>
              <p>We continuously evolve to bring you the latest in fashion and technology.</p>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h2>Join Our Community</h2>
          <p>
            Become part of the LUXE.CO family. Follow us on social media for the latest updates, styling tips,
            and exclusive offers. We're more than just a fashion brand – we're a community that celebrates
            style, creativity, and self-expression.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
