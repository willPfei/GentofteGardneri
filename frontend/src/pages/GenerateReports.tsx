import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';
import Article30Report from './reports/Article30Report';

const GenerateReports: React.FC = () => {
  const navigate = useNavigate();
  const [currentReport, setCurrentReport] = useState<string | null>(null);

  const handleReportClick = (reportType: string) => {
    if (reportType === 'article30') {
      setCurrentReport('article30');
    } else {
      alert(`Generating ${reportType} report... This functionality is not yet implemented.`);
    }
  };

  const handleBackToReports = () => {
    setCurrentReport(null);
  };

  // If a report is selected, show that report
  if (currentReport === 'article30') {
    return <Article30Report onBack={handleBackToReports} />;
  }

  // Report data with icons and descriptions
  const reports = [
    {
      id: 'article30',
      title: 'Records Of Processing Activities',
      description: 'Generate a comprehensive report of all processing activities in compliance with GDPR Article 30 requirements.',
      icon: '📋'
    },
    {
      id: 'risk-overview',
      title: 'Risk Overview',
      description: 'Visualize and analyze the risk assessment data across your organization\'s processing activities.',
      icon: '⚠️'
    },
    {
      id: 'dsr-categories',
      title: 'Data Subject Requests',
      description: 'Report on data subject request categories, status, and resolution metrics.',
      icon: '👤'
    },
    {
      id: 'vendors-report',
      title: 'Vendor Compliance',
      description: 'Overview of vendor compliance statuses, contract dates, and data processing agreements.',
      icon: '🏭'
    },
    {
      id: 'systems-inventory',
      title: 'IT Systems Inventory',
      description: 'Complete inventory report of all IT systems, their purposes, and processing activities.',
      icon: '💻'
    }
  ];

  // Otherwise show the report selection screen
  return (
    <div className="reports-container">
      <div className="module-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h2>Generate Reports</h2>
      </div>
      
      <p className="module-description" style={{ marginBottom: '30px', fontSize: '16px', color: 'var(--text-color-dark-secondary)' }}>
        Generate compliance reports based on your organization's data. Select a report type to continue.
      </p>

      <div className="reports-list">
        {reports.map(report => (
          <div key={report.id} className="report-card" onClick={() => handleReportClick(report.id)}>
            <div className="report-icon" style={{ color: 'var(--primary-color)' }}>{report.icon}</div>
            <h3 className="report-title">{report.title}</h3>
            <p className="report-description">{report.description}</p>
            <button className="report-button">Generate Report</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenerateReports; 