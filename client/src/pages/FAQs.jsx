import React, { useState } from 'react';
import './FAQs.css';

const FAQs = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      question: 'How do I track my order?',
      answer: 'Once your order has shipped, you\'ll receive an email with a tracking number. You can use this to track your package on our Track Order page or directly on the carrier\'s website.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept Mobile Money (MTN, Vodafone, AirtelTigo), Visa, Mastercard, and bank transfers. All payments are securely processed.'
    },
    {
      question: 'Can I change or cancel my order?',
      answer: 'You can modify or cancel your order within 1 hour of placing it. After that, we begin processing and cannot make changes. Please contact us immediately if you need assistance.'
    },
    {
      question: 'How do returns work?',
      answer: 'We offer free returns within 30 days of delivery. Items must be unworn, unwashed, and with original tags. Simply initiate a return through your account or contact our support team.'
    },
    {
      question: 'Do you ship internationally?',
      answer: 'Currently, we ship within Ghana only. We\'re working on expanding our shipping options to other African countries soon.'
    },
    {
      question: 'How do I know what size to order?',
      answer: 'Check our Size Guide page for detailed measurements. If you\'re between sizes, we recommend sizing up. You can also contact us for personalized sizing advice.'
    }
  ];

  return (
    <div className="faqs">
      <h1>Frequently Asked Questions</h1>
      <div className="accordion">
        {faqs.map((faq, index) => (
          <div key={index} className="accordion-item">
            <button
              className={`accordion-header ${activeIndex === index ? 'active' : ''}`}
              onClick={() => toggleAccordion(index)}
            >
              {faq.question}
              <span className="arrow">{activeIndex === index ? '▲' : '▼'}</span>
            </button>
            <div className={`accordion-content ${activeIndex === index ? 'open' : ''}`}>
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQs;
