import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/dashboard.css';

interface OrganizationInfo {
  name: string;
  address: string;
  email: string;
  phone: string;
  website: string;
}

interface System {
  name: string;
  systemId: string;
  description: string;
  responsibleParty: string;
  hostingType: string;
  dataClassification: string;
}

interface Vendor {
  name: string;
  id: string;
  description: string;
}

interface ProcessingActivity {
  activityId: string;
  description: string;
  purpose: string;
  dataSubjects: string[];
  dataTypes: string[];
  legalBasis: string;
  retentionPeriod: string;
  securityMeasures: string;
  dataTransfers: string;
  riskLevel: string;
  status: string;
  systems: System[];
  vendors: Vendor[];
}

interface ReportData {
  organization: OrganizationInfo;
  processingActivities: ProcessingActivity[];
}

interface Article30ReportProps {
  onBack?: () => void;
}

const Article30Report: React.FC<Article30ReportProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        // Check if user is authenticated
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        if (!isAuthenticated) {
          throw new Error('User is not authenticated');
        }

        // Get current user and organization information
        const currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) {
          throw new Error('User information not found');
        }
        
        const currentUser = JSON.parse(currentUserStr);
        
        // Get data from localStorage
        const activitiesStr = localStorage.getItem('ropa_activities');
        const systemsStr = localStorage.getItem('ropa_systems');
        const vendorsStr = localStorage.getItem('ropa_vendors');
        
        const activities = activitiesStr ? JSON.parse(activitiesStr) : [];
        const systems = systemsStr ? JSON.parse(systemsStr) : [];
        const vendors = vendorsStr ? JSON.parse(vendorsStr) : [];
        
        // Get organization info from localStorage
        const orgInfoStr = localStorage.getItem('ropa_org_info');
        const orgInfo = orgInfoStr ? JSON.parse(orgInfoStr) : null;
        
        // Build the report data structure using actual data
        const reportData: ReportData = {
          organization: {
            name: orgInfo?.name || currentUser.organizationName || 'Unknown Organization',
            address: orgInfo ? `${orgInfo.address}, ${orgInfo.city}, ${orgInfo.postalCode}, ${orgInfo.country}` : currentUser.organizationAddress || '',
            email: orgInfo?.email || currentUser.organizationEmail || currentUser.email || '',
            phone: orgInfo?.phone || currentUser.organizationPhone || '',
            website: orgInfo?.website || currentUser.organizationWebsite || ''
          },
          processingActivities: activities.map((activity: any) => {
            // Find associated systems
            const activitySystems = activity.systemIds 
              ? systems.filter((system: any) => activity.systemIds.includes(system.id))
              : [];
              
            // Find associated vendors
            const activityVendors = activity.vendorIds
              ? vendors.filter((vendor: any) => activity.vendorIds.includes(vendor.id))
              : [];
            
            // Gather security measures from all associated systems
            const systemSecurityMeasures = activitySystems
              .map((system: any) => system.securityMeasures)
              .filter(Boolean)
              .join(', ');
            
            return {
              activityId: activity.id,
              description: activity.name,
              purpose: activity.purpose,
              dataSubjects: activity.dataSubjects || [],
              dataTypes: activity.dataCategories || [],
              legalBasis: activity.legalBasis,
              retentionPeriod: activity.retentionPeriod,
              securityMeasures: systemSecurityMeasures || 'Not specified',
              dataTransfers: activity.dataTransfers,
              riskLevel: activity.riskLevel,
              status: activity.status,
              systems: activitySystems,
              vendors: activityVendors
            };
          })
        };
        
        setReport(reportData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching report data:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/modules/generate-reports');
    }
  };

  if (loading) {
    return <div className="loading">Loading report...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!report) {
    return <div className="error-message">No report data available.</div>;
  }

  return (
    <div className="article30-container">
      <button className="back-button" onClick={handleBack}>
        ← Back to Reports
      </button>
      
      <div className="report-header">
        <h1>Records of Processing Activities Report</h1>
        <p className="subtitle">GDPR Article 30 Compliance</p>
      </div>

      <div className="report-section">
        <h2>Controller Information</h2>
        
        <div className="info-row">
          <div className="info-label">Organization:</div>
          <div className="info-value">{report.organization.name}</div>
        </div>
        
        <div className="info-row">
          <div className="info-label">Address:</div>
          <div className="info-value">{report.organization.address || 'Not specified'}</div>
        </div>
        
        <div className="info-row">
          <div className="info-label">Contact Email:</div>
          <div className="info-value">{report.organization.email || 'Not specified'}</div>
        </div>
        
        <div className="info-row">
          <div className="info-label">Phone:</div>
          <div className="info-value">{report.organization.phone || 'Not specified'}</div>
        </div>
        
        <div className="info-row">
          <div className="info-label">Website:</div>
          <div className="info-value">{report.organization.website || 'Not specified'}</div>
        </div>
      </div>

      <div className="report-section">
        <h2>Processing Activities</h2>
        
        {report.processingActivities.length === 0 ? (
          <p className="no-activities" style={{color: 'var(--text-color-dark-secondary)', textAlign: 'center', padding: '20px'}}>
            No processing activities have been registered.
          </p>
        ) : (
          <div className="activities-list">
            {report.processingActivities.map((activity, index) => (
              <div key={activity.activityId || index} className="activity-report-item">
                <h3>{activity.description}</h3>
                
                <div className="info-row">
                  <div className="info-label">Activity ID:</div>
                  <div className="info-value">{activity.activityId}</div>
                </div>
                
                <div className="info-row">
                  <div className="info-label">Purpose:</div>
                  <div className="info-value">{activity.purpose || 'Not specified'}</div>
                </div>
                
                <div className="info-row">
                  <div className="info-label">Legal Basis:</div>
                  <div className="info-value">{activity.legalBasis || 'Not specified'}</div>
                </div>
                
                <div className="info-row">
                  <div className="info-label">Data Subjects:</div>
                  <div className="info-value">
                    {Array.isArray(activity.dataSubjects) && activity.dataSubjects.length > 0 
                      ? activity.dataSubjects.join(', ') 
                      : 'None specified'}
                  </div>
                </div>
                
                <div className="info-row">
                  <div className="info-label">Data Categories:</div>
                  <div className="info-value">
                    {Array.isArray(activity.dataTypes) && activity.dataTypes.length > 0 
                      ? activity.dataTypes.join(', ') 
                      : 'None specified'}
                  </div>
                </div>
                
                <div className="info-row">
                  <div className="info-label">Retention Period:</div>
                  <div className="info-value">{activity.retentionPeriod || 'Not specified'}</div>
                </div>
                
                <div className="info-row">
                  <div className="info-label">Security Measures:</div>
                  <div className="info-value">{activity.securityMeasures || 'Not specified'}</div>
                </div>
                
                <div className="info-row">
                  <div className="info-label">Data Transfers:</div>
                  <div className="info-value">{activity.dataTransfers || 'Not specified'}</div>
                </div>
                
                <div className="info-row">
                  <div className="info-label">Risk Level:</div>
                  <div className="info-value">{activity.riskLevel || 'Not specified'}</div>
                </div>
                
                {activity.systems && activity.systems.length > 0 && (
                  <div>
                    <h3>Associated Systems</h3>
                    {activity.systems.map((system, idx) => (
                      <div key={idx} style={{marginBottom: '10px', padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px'}}>
                        <div style={{fontWeight: 'var(--font-weight-semibold)'}}>{system.name}</div>
                        <div style={{color: 'var(--text-color-dark-secondary)', fontSize: '14px'}}>{system.description || 'No description'}</div>
                      </div>
                    ))}
                  </div>
                )}
                
                {activity.vendors && activity.vendors.length > 0 && (
                  <div>
                    <h3>Associated Vendors</h3>
                    {activity.vendors.map((vendor, idx) => (
                      <div key={idx} style={{marginBottom: '10px', padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px'}}>
                        <div style={{fontWeight: 'var(--font-weight-semibold)'}}>{vendor.name}</div>
                        <div style={{color: 'var(--text-color-dark-secondary)', fontSize: '14px'}}>{vendor.description || 'No description'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <button className="print-button" onClick={handlePrint}>
        <span>🖨️</span> Print Report
      </button>
    </div>
  );
};

export default Article30Report; 