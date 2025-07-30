import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  
  const modules = [
    {
      id: 'contracts',
      title: 'Contract Management',
      description: 'Track and manage vendor contracts, link to IT systems, and monitor compliance requirements efficiently.',
      icon: '📑',
      details: [
        'Centralized contract repository for all vendor agreements',
        'Automated tracking of contract expiration dates and renewal periods',
        'Link contracts to relevant IT systems and processing activities',
        'Document data protection requirements and compliance measures',
        'Generate contract inventories for compliance documentation'
      ]
    },
    {
      id: 'systems',
      title: 'IT Systems Inventory',
      description: 'Document system details, track ownership, and manage relationships with contracts and processing activities.',
      icon: '💻',
      details: [
        'Comprehensive IT system documentation and categorization',
        'Track system owners, administrators, and key stakeholders',
        'Map data flows between systems and third parties',
        'Monitor security measures and compliance requirements',
        'Maintain up-to-date system documentation for audits'
      ]
    },
    {
      id: 'activities',
      title: 'Processing Activities',
      description: 'Document and manage data processing activities, track data types, legal basis, and retention periods.',
      icon: '📊',
      details: [
        'Document all data processing activities in detail',
        'Track legal basis for processing and retention periods',
        'Map data categories and special category data',
        'Link activities to systems and data processors',
        'Generate RoPA reports for regulatory compliance'
      ]
    }
  ];

  const steps = [
    {
      title: 'Register an account',
      description: 'Create your organization profile or join an existing one to get started with your compliance journey.'
    },
    {
      title: 'Set up your inventory',
      description: 'Document your IT systems and contracts to establish a foundation for your compliance documentation.'
    },
    {
      title: 'Record processing activities',
      description: 'Link activities to systems and establish legal basis for processing to ensure data protection compliance.'
    },
    {
      title: 'Generate reports',
      description: 'Create comprehensive compliance documentation as needed for audits and regulatory requirements.'
    }
  ];

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleLearnMore = (moduleId: string) => {
    setSelectedModule(moduleId);
  };

  const handleCloseModal = () => {
    setSelectedModule(null);
  };

  const selectedModuleData = modules.find(m => m.id === selectedModule);

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-background"></div>
        <div className="compliance-shield"></div>
        <div className="hero-content">
          <div className="hero-logo">📊</div>
          <h1 className="hero-title">Records of Processing Activities Platform</h1>
          <p className="hero-subtitle">
            Streamline your data protection compliance with our comprehensive RoPA solution. 
            Track, manage, and document all your data processing activities in one place.
          </p>
          <button className="hero-cta" onClick={handleGetStarted}>
            Get Started
          </button>
        </div>
      </section>
      
      <section className="features-section">
        <h2 className="section-title">Key Features</h2>
        <p className="section-subtitle">
          Our platform provides all the tools you need to maintain data protection compliance 
          with an intuitive, user-friendly interface.
        </p>
        
        <div className="features-grid">
          {modules.map(module => (
            <div key={module.id} className="feature-card">
              <div className="feature-icon">
                {module.icon}
              </div>
              <h3 className="feature-title">{module.title}</h3>
              <p className="feature-description">{module.description}</p>
              <button 
                className="feature-link" 
                onClick={() => handleLearnMore(module.id)}
                aria-label={`Learn more about ${module.title}`}
              >
                Learn more
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </section>
      
      <section className="steps-section">
        <div className="steps-container">
          <h2 className="section-title">Getting Started</h2>
          <p className="section-subtitle">
            Follow these simple steps to start managing your data protection compliance effectively.
          </p>
          
          <ul className="steps-list">
            {steps.map((step, index) => (
              <li key={index} className="step-item">
                <div className="step-content">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
      
      <section className="cta-section">
        <h2 className="cta-title">Ready to simplify your data protection compliance?</h2>
        <p className="cta-description">
          Join thousands of organizations that trust our platform for their 
          Records of Processing Activities management.
        </p>
        <button className="hero-cta" onClick={handleGetStarted}>
          Get Started Now
        </button>
      </section>
      
      <footer className="home-footer">
        <p className="footer-content">
          © {new Date().getFullYear()} RoPA Platform • Your Data Protection Compliance Solution
        </p>
      </footer>

      {selectedModule && selectedModuleData && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>×</button>
            <div className="modal-header">
              <div className="modal-icon">{selectedModuleData.icon}</div>
              <h3 className="modal-title">{selectedModuleData.title}</h3>
            </div>
            <p className="modal-description">{selectedModuleData.description}</p>
            <div className="modal-details">
              <h4 className="modal-subtitle">Key Features:</h4>
              <ul className="modal-list">
                {selectedModuleData.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home; 