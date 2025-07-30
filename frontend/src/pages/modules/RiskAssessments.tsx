import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/modules.css';

// Define interfaces for our data structures
export interface RiskAssessment {
  id: string;
  activityId: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  riskDescription: string;
  rationale: string;
  mitigationMeasures: string;
  piaCompleted: boolean;
  piaDate?: string;
  piaOutcome?: string;
  dpiaRequired: boolean;
  dpiaCompleted?: boolean;
  dpiaDate?: string;
  dpiaOutcome?: string;
  createdAt: string;
  updatedAt: string;
  status: 'Open' | 'Mitigated' | 'Accepted' | 'Transferred';
}

interface ProcessingActivity {
  id: string;
  name: string;
  description: string;
  dataCategories: string[];
  dataSubjects: string[];
  legalBasis: string;
  systemIds: string[];
  retentionPeriod: string;
  recipients: string;
}

// Risk level options with descriptions
const riskLevelOptions = [
  { value: 'Low', description: 'Minimal impact, standard controls sufficient' },
  { value: 'Medium', description: 'Moderate impact, additional controls recommended' },
  { value: 'High', description: 'Significant impact, strong controls required, PIA recommended' },
  { value: 'Critical', description: 'Severe impact, DPIA required, may need to reconsider processing' }
];

// Initial mock data
const initialRiskAssessments: RiskAssessment[] = [
  {
    id: 'r001',
    activityId: 'a001',
    riskLevel: 'Medium',
    riskDescription: 'Potential unauthorized access to customer data',
    rationale: 'Large volume of personal data stored, but strong access controls in place',
    mitigationMeasures: 'Role-based access control, encryption at rest, regular access reviews',
    piaCompleted: true,
    piaDate: '2023-10-15',
    piaOutcome: 'Acceptable with current controls',
    dpiaRequired: false,
    dpiaCompleted: false,
    createdAt: '2023-10-01',
    updatedAt: '2023-10-15',
    status: 'Mitigated'
  },
  {
    id: 'r002',
    activityId: 'a002',
    riskLevel: 'High',
    riskDescription: 'Processing of employee financial data poses significant privacy risk',
    rationale: 'Financial data is sensitive and could cause significant harm if breached',
    mitigationMeasures: 'End-to-end encryption, strict access controls, data minimization',
    piaCompleted: true,
    piaDate: '2023-09-20',
    piaOutcome: 'Additional controls needed',
    dpiaRequired: true,
    dpiaCompleted: true,
    dpiaDate: '2023-10-05',
    dpiaOutcome: 'Processing justified with enhanced controls',
    createdAt: '2023-09-01',
    updatedAt: '2023-10-05',
    status: 'Mitigated'
  }
];

const RiskAssessments: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activityIdFilter = queryParams.get('activityId');
  
  // State variables
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [activities, setActivities] = useState<ProcessingActivity[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof RiskAssessment>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentRiskId, setCurrentRiskId] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Form data for new risk assessment
  const [formData, setFormData] = useState<Omit<RiskAssessment, 'id' | 'createdAt' | 'updatedAt'>>({
    activityId: activityIdFilter || '',
    riskLevel: 'Medium',
    riskDescription: '',
    rationale: '',
    mitigationMeasures: '',
    piaCompleted: false,
    dpiaRequired: false,
    dpiaCompleted: false,
    status: 'Open'
  });
  
  // Load data from localStorage on component mount
  useEffect(() => {
    // Load processing activities
    const storedActivities = localStorage.getItem('ropa_activities');
    if (storedActivities) {
      setActivities(JSON.parse(storedActivities));
    }
    
    // Load risk assessments
    const storedRiskAssessments = localStorage.getItem('ropa_risk_assessments');
    if (storedRiskAssessments) {
      setRiskAssessments(JSON.parse(storedRiskAssessments));
    } else {
      // Use initial data if nothing in localStorage
      setRiskAssessments(initialRiskAssessments);
      // Store initial data in localStorage
      localStorage.setItem('ropa_risk_assessments', JSON.stringify(initialRiskAssessments));
    }
    
    // If we have an activity filter, pre-select it in the form
    if (activityIdFilter) {
      setFormData(prev => ({
        ...prev,
        activityId: activityIdFilter
      }));
    }
  }, [activityIdFilter]);
  
  // Save risk assessments to localStorage whenever they change
  useEffect(() => {
    if (riskAssessments.length > 0) {
      localStorage.setItem('ropa_risk_assessments', JSON.stringify(riskAssessments));
    }
  }, [riskAssessments]);
  
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };
  
  // Get the current risk assessment
  const getCurrentRiskAssessment = () => {
    return riskAssessments.find(risk => risk.id === currentRiskId) || null;
  };
  
  // Get activity name by ID
  const getActivityName = (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    return activity ? activity.name : 'Unknown Activity';
  };
  
  // Filter and sort risk assessments
  const filteredRiskAssessments = riskAssessments
    .filter(risk => {
      // Filter by activity ID if provided
      if (activityIdFilter && risk.activityId !== activityIdFilter) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm) {
        const activityName = getActivityName(risk.activityId).toLowerCase();
        return (
          risk.riskDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
          risk.riskLevel.toLowerCase().includes(searchTerm.toLowerCase()) ||
          risk.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activityName.includes(searchTerm.toLowerCase())
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortDirection === 'asc' 
          ? fieldA.localeCompare(fieldB) 
          : fieldB.localeCompare(fieldA);
      }
      
      return 0;
    });
  
  // Handle sort change
  const handleSort = (field: keyof RiskAssessment) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Get sort indicator
  const getSortIndicator = (field: keyof RiskAssessment) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };
  
  // Get risk level badge class
  const getRiskLevelClass = (level: string) => {
    switch (level) {
      case 'Low': return 'badge-success';
      case 'Medium': return 'badge-warning';
      case 'High': return 'badge-danger';
      case 'Critical': return 'badge-critical';
      default: return 'badge-default';
    }
  };
  
  // Get status badge class
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Open': return 'badge-danger';
      case 'Mitigated': return 'badge-success';
      case 'Accepted': return 'badge-warning';
      case 'Transferred': return 'badge-info';
      default: return 'badge-default';
    }
  };
  
  const handleAddRiskAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    const newRiskAssessment: RiskAssessment = {
      id: `r${Date.now()}`, // Generate a unique ID based on timestamp
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedRiskAssessments = [...riskAssessments, newRiskAssessment];
    setRiskAssessments(updatedRiskAssessments);
    localStorage.setItem('ropa_risk_assessments', JSON.stringify(updatedRiskAssessments));
    setShowAddModal(false);
    setFormData({
      activityId: activityIdFilter || '',
      riskLevel: 'Medium',
      riskDescription: '',
      rationale: '',
      mitigationMeasures: '',
      piaCompleted: false,
      dpiaRequired: false,
      dpiaCompleted: false,
      status: 'Open'
    });
  };
  
  const handleViewDetails = (riskId: string) => {
    setCurrentRiskId(riskId);
    setShowViewModal(true);
  };
  
  const handleEditRiskAssessment = (riskId: string) => {
    setCurrentRiskId(riskId);
    setShowEditModal(true);
  };
  
  const handleUpdateRiskAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRiskId) {
      const updatedRiskAssessments = riskAssessments.map(risk =>
        risk.id === currentRiskId ? { ...risk, ...formData, updatedAt: new Date().toISOString() } : risk
      );
      setRiskAssessments(updatedRiskAssessments);
      localStorage.setItem('ropa_risk_assessments', JSON.stringify(updatedRiskAssessments));
      setShowEditModal(false);
    }
  };
  
  const updateCurrentRiskField = (field: keyof RiskAssessment, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  return (
    <div className="module-container">
      <header className="module-header">
        <div className="header-content">
          <div className="header-title">
            <button onClick={handleBackToDashboard} className="back-button">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.8332 10H4.1665" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.99984 15.8334L4.1665 10.0001L9.99984 4.16675" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>
            <h1>Risk Assessments</h1>
            {activityIdFilter && (
              <div className="filter-badge">
                Filtered by activity: {activities.find(a => a.id === activityIdFilter)?.name}
                <button 
                  onClick={() => navigate('/modules/risk-assessments')} 
                  className="clear-filter-button"
                  title="Clear filter"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          <div className="header-actions">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search risk assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <button onClick={() => setShowAddModal(true)} className="add-button">
              New Risk Assessment
            </button>
          </div>
        </div>
      </header>

      <main className="module-content">
        {filteredRiskAssessments.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('riskDescription')}>
                    Risk Description {getSortIndicator('riskDescription')}
                  </th>
                  <th onClick={() => handleSort('activityId')}>
                    Processing Activity {getSortIndicator('activityId')}
                  </th>
                  <th onClick={() => handleSort('riskLevel')}>
                    Risk Level {getSortIndicator('riskLevel')}
                  </th>
                  <th onClick={() => handleSort('status')}>
                    Status {getSortIndicator('status')}
                  </th>
                  <th onClick={() => handleSort('piaCompleted')}>
                    PIA {getSortIndicator('piaCompleted')}
                  </th>
                  <th onClick={() => handleSort('dpiaRequired')}>
                    DPIA {getSortIndicator('dpiaRequired')}
                  </th>
                  <th onClick={() => handleSort('updatedAt')}>
                    Last Updated {getSortIndicator('updatedAt')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRiskAssessments.map(risk => (
                  <tr key={risk.id}>
                    <td>{risk.riskDescription}</td>
                    <td>{getActivityName(risk.activityId)}</td>
                    <td>
                      <span className={`badge ${getRiskLevelClass(risk.riskLevel)}`}>
                        {risk.riskLevel}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusClass(risk.status)}`}>
                        {risk.status}
                      </span>
                    </td>
                    <td>
                      {risk.piaCompleted ? (
                        <span className="badge badge-success">Completed</span>
                      ) : (
                        <span className="badge badge-danger">Not Completed</span>
                      )}
                    </td>
                    <td>
                      {risk.dpiaRequired ? (
                        risk.dpiaCompleted ? (
                          <span className="badge badge-success">Completed</span>
                        ) : (
                          <span className="badge badge-warning">Required</span>
                        )
                      ) : (
                        <span className="badge badge-default">Not Required</span>
                      )}
                    </td>
                    <td>{new Date(risk.updatedAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-button view-button" 
                          title="View Details"
                          onClick={() => handleViewDetails(risk.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2.45825 12C3.73253 7.94288 7.52281 5 12.0004 5C16.4781 5 20.2684 7.94291 21.5426 12C20.2684 16.0571 16.4781 19 12.0005 19C7.52281 19 3.73251 16.0571 2.45825 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button 
                          className="action-button edit-button" 
                          title="Edit"
                          onClick={() => handleEditRiskAssessment(risk.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4C3.44772 4 3 4.44772 3 5V19C3 19.5523 3.44772 20 4 20H18C18.5523 20 19 19.5523 19 19V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18.5 2.5C18.7626 2.23735 19.1131 2.07731 19.5 2.07731C19.8869 2.07731 20.2374 2.23735 20.5 2.5C20.7626 2.76264 20.9227 3.11307 20.9227 3.5C20.9227 3.88693 20.7626 4.23735 20.5 4.5L12 13L9 14L10 11L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-content">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3>No Risk Assessments Found</h3>
              <p>
                {searchTerm 
                  ? "No risk assessments match your search criteria." 
                  : activityIdFilter 
                    ? "No risk assessments found for this processing activity." 
                    : "You haven't created any risk assessments yet."}
              </p>
              <button onClick={() => setShowAddModal(true)} className="primary-button">
                Create Risk Assessment
              </button>
            </div>
          </div>
        )}
      </main>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>New Risk Assessment</h2>
              <button onClick={() => setShowAddModal(false)} className="close-button">×</button>
            </div>
            <div className="modal-content">
              <form onSubmit={handleAddRiskAssessment}>
                <div className="form-group">
                  <label htmlFor="activityId">Processing Activity</label>
                  <select
                    id="activityId"
                    value={formData.activityId}
                    onChange={(e) => setFormData({ ...formData, activityId: e.target.value })}
                    required
                  >
                    <option value="" disabled>Select an activity</option>
                    {activities.map(activity => (
                      <option key={activity.id} value={activity.id}>{activity.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="riskLevel">Risk Level</label>
                  <select
                    id="riskLevel"
                    value={formData.riskLevel}
                    onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as RiskAssessment['riskLevel'] })}
                    required
                  >
                    {riskLevelOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.description}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="riskDescription">Risk Description</label>
                  <textarea
                    id="riskDescription"
                    value={formData.riskDescription}
                    onChange={(e) => setFormData({ ...formData, riskDescription: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="rationale">Rationale</label>
                  <textarea
                    id="rationale"
                    value={formData.rationale}
                    onChange={(e) => setFormData({ ...formData, rationale: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="mitigationMeasures">Mitigation Measures</label>
                  <textarea
                    id="mitigationMeasures"
                    value={formData.mitigationMeasures}
                    onChange={(e) => setFormData({ ...formData, mitigationMeasures: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="piaCompleted">
                    <input
                      type="checkbox"
                      id="piaCompleted"
                      checked={formData.piaCompleted}
                      onChange={(e) => setFormData({ ...formData, piaCompleted: e.target.checked })}
                    />
                    PIA Completed
                  </label>
                </div>
                <div className="form-group">
                  <label htmlFor="dpiaRequired">
                    <input
                      type="checkbox"
                      id="dpiaRequired"
                      checked={formData.dpiaRequired}
                      onChange={(e) => setFormData({ ...formData, dpiaRequired: e.target.checked })}
                    />
                    DPIA Required
                  </label>
                </div>
                <div className="modal-footer">
                  <button onClick={() => setShowAddModal(false)} className="secondary-button">Cancel</button>
                  <button type="submit" className="primary-button">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showViewModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Risk Assessment Details</h2>
              <button onClick={() => setShowViewModal(false)} className="close-button">×</button>
            </div>
            <div className="modal-content">
              <p>Details for risk assessment ID: {currentRiskId}</p>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Risk Assessment</h2>
              <button onClick={() => setShowEditModal(false)} className="close-button">×</button>
            </div>
            <div className="modal-content">
              <form onSubmit={handleUpdateRiskAssessment}>
                <div className="form-group">
                  <label htmlFor="editRiskDescription">Risk Description</label>
                  <textarea
                    id="editRiskDescription"
                    value={getCurrentRiskAssessment()?.riskDescription || ''}
                    onChange={(e) => updateCurrentRiskField('riskDescription', e.target.value)}
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button onClick={() => setShowEditModal(false)} className="secondary-button">Cancel</button>
                  <button type="submit" className="primary-button">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskAssessments; 