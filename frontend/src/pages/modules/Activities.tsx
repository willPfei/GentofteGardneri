import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { downloadTemplate, parseCSV } from '../../utils/csvUtils';
import EditModal from '../../components/EditModal';
import '../../styles/modules.css';
import { useOrganization } from '../../context/OrganizationContext';
import OrganizationSelector from '../../components/OrganizationSelector';
import { activitiesApi } from '../../utils/apiService';

export interface ProcessingActivity {
  id: string;
  name: string;
  description: string;
  dataCategories: string[];
  dataSubjects: string[];
  legalBasis: string;
  systemIds: string[];
  retentionPeriod: string;
  recipients: string;
  organizational_unit_id?: string;
  organizational_unit_name?: string;
}

interface System {
  id: string;
  name: string;
  owner: string;
  storageLocation: string;
}

const legalBasisOptions = [
  'Consent',
  'Contract',
  'Legal Obligation',
  'Vital Interests',
  'Public Task',
  'Legitimate Interests'
];

const dataCategoryOptions = [
  'Name',
  'Email',
  'Phone',
  'Address',
  'Date of Birth',
  'ID Number',
  'Financial Data',
  'Health Data',
  'Biometric Data',
  'Location Data'
];

const dataSubjectOptions = [
  'Employees',
  'Customers',
  'Suppliers',
  'Partners',
  'Website Visitors',
  'Job Applicants',
  'Children',
  'Patients'
];

// Initial mock data
const initialActivities: ProcessingActivity[] = [
  {
    id: 'a001',
    name: 'Customer Data Processing',
    description: 'Processing customer data for sales and support',
    dataCategories: ['Name', 'Email', 'Phone', 'Address'],
    dataSubjects: ['Customers'],
    legalBasis: 'Contract',
    systemIds: ['s001'],
    retentionPeriod: '5 years after contract termination',
    recipients: 'Internal sales and support teams'
  },
  {
    id: 'a002',
    name: 'Employee Payroll Processing',
    description: 'Processing employee data for payroll purposes',
    dataCategories: ['Name', 'ID Number', 'Financial Data'],
    dataSubjects: ['Employees'],
    legalBasis: 'Legal Obligation',
    systemIds: ['s002'],
    retentionPeriod: '7 years',
    recipients: 'HR department, Tax authorities'
  },
  {
    id: 'a003',
    name: 'Marketing Analytics',
    description: 'Analysis of customer behavior for marketing purposes',
    dataCategories: ['Email', 'Location Data'],
    dataSubjects: ['Customers', 'Website Visitors'],
    legalBasis: 'Legitimate Interests',
    systemIds: ['s001', 's003'],
    retentionPeriod: '2 years',
    recipients: 'Marketing department'
  }
];

const Activities: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const systemIdParam = queryParams.get('systemId');

  const [activities, setActivities] = useState<ProcessingActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ProcessingActivity[]>([]);
  const [systems, setSystems] = useState<System[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Omit<ProcessingActivity, 'id'>>({
    name: '',
    description: '',
    dataCategories: [],
    dataSubjects: [],
    legalBasis: '',
    systemIds: [],
    retentionPeriod: '',
    recipients: '',
    organizational_unit_id: ''
  });
  const [sortConfig, setSortConfig] = useState<{ field: keyof ProcessingActivity; direction: 'asc' | 'desc' } | null>(null);
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(systemIdParam);
  const [isEditing, setIsEditing] = useState(false);
  const [currentActivityId, setCurrentActivityId] = useState('');
  const [editData, setEditData] = useState<ProcessingActivity | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string[]>([]);
  
  // Organization context
  const { 
    selectedEntityId,
    selectedEntityName,
    organization,
    organizationalUnits,
    getEntityName,
    isEntitySelected,
    isChildOfSelectedEntity,
    loadOrganizationData 
  } = useOrganization();

  // Load data
  useEffect(() => {
    // Load organization data
    loadOrganizationData();
    
    // Load activities from API
    const loadActivities = async () => {
      try {
        const loadedActivities = await activitiesApi.getAll();
        setActivities(loadedActivities);
      } catch (error) {
        console.error('Failed to load activities:', error);
        // Initialize with empty array if API fails
        setActivities([]);
      }
    };
    
    loadActivities();

    // Load systems from localStorage
    const savedSystems = localStorage.getItem('ropa_systems');
    if (savedSystems) {
      const parsedSystems = JSON.parse(savedSystems);
      setSystems(parsedSystems.map((system: any) => ({ 
        id: system.id, 
        name: system.name,
        owner: system.owner,
        storageLocation: system.storageLocation
      })));
    }
  }, [loadOrganizationData]);
  
  // Filter activities based on selected entity, system, and search term
  useEffect(() => {
    let filtered = [...activities];
    
    // Apply organization filter if selected
    if (selectedEntityId) {
      filtered = filtered.filter(activity => 
        activity.organizational_unit_id === selectedEntityId || 
        isChildOfSelectedEntity(activity.organizational_unit_id)
      );
    }
    
    // Apply system filter if selected
    if (selectedSystemId) {
      filtered = filtered.filter(activity => 
        activity.systemIds.includes(selectedSystemId)
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.name.toLowerCase().includes(term) ||
        activity.description.toLowerCase().includes(term) ||
        activity.legalBasis.toLowerCase().includes(term) ||
        activity.recipients.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting if configured
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.field]?.toString().toLowerCase() || '';
        const bValue = b[sortConfig.field]?.toString().toLowerCase() || '';
        
        if (sortConfig.direction === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
    }
    
    setFilteredActivities(filtered);
  }, [activities, selectedEntityId, selectedSystemId, sortConfig, isChildOfSelectedEntity, searchTerm]);

  // When activities change, save to localStorage
  useEffect(() => {
    localStorage.setItem('ropa_activities', JSON.stringify(activities));
  }, [activities]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };
  
  const handleSort = (field: keyof ProcessingActivity) => {
    if (field === sortConfig?.field) {
      setSortConfig({
        field: field,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setSortConfig({ field, direction: 'asc' });
    }
  };
  
  // Optimize the renderOrganizationalUnitOptions function
  const renderOrganizationalUnitOptions = React.useMemo(() => {
    const options = [];
    
    // Add the main organization as an option
    if (organization) {
      options.push(
        <option key={organization.id} value={organization.id}>
          {organization.name} (Main Organization)
        </option>
      );
    }
    
    // Helper function to render options with proper indentation
    const renderOptions = (units: typeof organizationalUnits, parentId: string | null = null, level = 0) => {
      const filteredUnits = units.filter(unit => unit.parent_unit_id === parentId);
      
      filteredUnits.forEach(unit => {
        const indent = '—'.repeat(level);
        const prefix = level > 0 ? indent + ' ' : '';
        const unitTypeIndicator = unit.unit_type === 'SUBSIDIARY' ? '🏢' : '🔹';
        
        options.push(
          <option key={unit.id} value={unit.id}>
            {prefix}{unitTypeIndicator} {unit.name}
          </option>
        );
        
        // Recursively add children
        renderOptions(units, unit.id, level + 1);
      });
    };
    
    renderOptions(organizationalUnits);
    
    return options;
  }, [organization, organizationalUnits]); // Only recalculate when organization data changes

  // Optimize the handleInputChange and handleEditChange functions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // If changing organizational unit, pre-compute the name to avoid layout shifts later
    if (name === 'organizational_unit_id') {
      const orgUnitName = value ? getEntityName(value) : '';
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        organizational_unit_name: orgUnitName // Pre-compute the name right away
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editData) {
      // If changing organizational unit, pre-compute the name to avoid layout shifts later
      if (name === 'organizational_unit_id') {
        const orgUnitName = value ? getEntityName(value) : '';
        setEditData({
          ...editData,
          [name]: value,
          organizational_unit_name: orgUnitName // Pre-compute the name right away
        });
      } else {
        setEditData({
          ...editData,
          [name]: value
        });
      }
    }
  };
  
  // Handle checkbox changes for multi-select fields
  const handleCheckboxChange = (fieldName: string, value: string, targetState: 'form' | 'edit') => {
    if (targetState === 'form') {
      setFormData(prev => {
        const currentValues = prev[fieldName as keyof typeof prev] as string[];
        if (currentValues.includes(value)) {
          return {
            ...prev,
            [fieldName]: currentValues.filter(v => v !== value)
          };
        } else {
          return {
            ...prev,
            [fieldName]: [...currentValues, value]
          };
        }
      });
    } else if (targetState === 'edit' && editData) {
      setEditData(prev => {
        if (!prev) return prev;
        const currentValues = prev[fieldName as keyof typeof prev] as string[];
        if (currentValues.includes(value)) {
          return {
            ...prev,
            [fieldName]: currentValues.filter(v => v !== value)
          };
        } else {
          return {
            ...prev,
            [fieldName]: [...currentValues, value]
          };
        }
      });
    }
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, targetState: 'form' | 'edit') => {
    const { name, options } = e.target;
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);

    if (targetState === 'form') {
      setFormData(prev => ({ ...prev, [name]: selectedValues }));
    } else if (targetState === 'edit' && editData) {
      setEditData({
        ...editData,
        [name]: selectedValues
      });
    }
  };

  // File upload handling
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        // Implement CSV parsing or use a library
        const parsedData = JSON.parse(text);
        setActivities(prev => [...prev, ...parsedData]);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error: any) {
        setUploadError([`Error uploading file: ${error.message}`]);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get the organizational unit name
    let orgUnitName = '';
    if (formData.organizational_unit_id) {
      orgUnitName = getEntityName(formData.organizational_unit_id);
    }
    
    // Create new activity with API
    try {
      const newActivityData = {
        ...formData,
        organizational_unit_name: orgUnitName
      };
      
      const newActivity = await activitiesApi.create(newActivityData);
      setActivities(prev => [...prev, newActivity]);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        dataCategories: [],
        dataSubjects: [],
        legalBasis: '',
        systemIds: [],
        retentionPeriod: '',
        recipients: '',
        organizational_unit_id: ''
      });
      
      setShowForm(false);
    } catch (error) {
      console.error('Error creating activity:', error);
      alert('Failed to create activity. Please try again.');
    }
  };

  const handleEditClick = (activity: ProcessingActivity) => {
    setIsEditing(true);
    setCurrentActivityId(activity.id);
    setEditData(activity);
  };

  const handleEditSave = async () => {
    if (editData) {
      // Get the organizational unit name
      let orgUnitName = '';
      if (editData.organizational_unit_id) {
        orgUnitName = getEntityName(editData.organizational_unit_id);
      }
      
      try {
        const updatedActivityData = {
          ...editData,
          organizational_unit_name: orgUnitName
        };
        
        await activitiesApi.update(currentActivityId, updatedActivityData);
        
        // Update local state
        const updatedActivities = activities.map(activity => {
          if (activity.id === currentActivityId) {
            return updatedActivityData;
          }
          return activity;
        });
        
        setActivities(updatedActivities);
        handleEditCancel();
      } catch (error) {
        console.error('Error updating activity:', error);
        alert('Failed to update activity. Please try again.');
      }
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setCurrentActivityId('');
    setEditData(null);
  };

  const handleDeleteActivity = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this processing activity?');
    if (confirmed) {
      try {
        await activitiesApi.delete(id);
        const updatedActivities = activities.filter(activity => activity.id !== id);
        setActivities(updatedActivities);
      } catch (error) {
        console.error('Error deleting activity:', error);
        alert('Failed to delete activity. Please try again.');
      }
    }
  };

  // Add a debounced search handler
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Use setTimeout to debounce the search input
    const value = e.target.value;
    setTimeout(() => {
      setSearchTerm(value);
    }, 300); // 300ms debounce time
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
            <h1>Processing Activities</h1>
            {selectedSystemId && (
              <div className="filter-badge">
                Filtered by system: {systems.find(s => s.id === selectedSystemId)?.name}
                <button 
                  onClick={() => {
                    setSelectedSystemId(null);
                    window.history.pushState({}, '', location.pathname);
                  }}
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
                placeholder="Search activities..."
                defaultValue={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
              <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="button-group">
              <button onClick={() => downloadTemplate('activities')} className="template-button">
                Download Template
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".csv"
                onChange={handleFileUpload}
              />
              <button onClick={() => fileInputRef.current?.click()} className="upload-button">
                Upload CSV
              </button>
              <button onClick={() => setShowForm(!showForm)} className="add-button">
                {showForm ? 'Cancel' : 'Add Activity'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="module-content">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}>
                  Activity Name
                  {sortConfig?.field === 'name' && (
                    <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th onClick={() => handleSort('legalBasis')}>
                  Legal Basis
                  {sortConfig?.field === 'legalBasis' && (
                    <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th>Data Categories</th>
                <th>Systems Involved</th>
                <th onClick={() => handleSort('retentionPeriod')}>
                  Retention Period
                  {sortConfig?.field === 'retentionPeriod' && (
                    <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th onClick={() => handleSort('organizational_unit_name')}>
                  Organizational Unit
                  {sortConfig?.field === 'organizational_unit_name' && (
                    <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.length > 0 ? (
                filteredActivities.map(activity => (
                  <tr key={activity.id}>
                    <td>{activity.name}</td>
                    <td>{activity.legalBasis}</td>
                    <td>
                      <div className="tag-container">
                        {activity.dataCategories.map(category => (
                          <span key={category} className="data-tag">{category}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      {activity.systemIds.map(systemId => {
                        const system = systems.find(s => s.id === systemId);
                        return system ? (
                          <div key={systemId} className="system-badge">
                            {system.name}
                          </div>
                        ) : null;
                      })}
                    </td>
                    <td>{activity.retentionPeriod}</td>
                    <td>{activity.organizational_unit_name || 'Not assigned'}</td>
                    <td className="actions-cell">
                      <button 
                        className="action-button view-button"
                        title="View details"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8.00016 3.33325C3.33349 3.33325 1.3335 7.99992 1.3335 7.99992C1.3335 7.99992 3.33349 12.6666 8.00016 12.6666C12.6668 12.6666 14.6668 7.99992 14.6668 7.99992C14.6668 7.99992 12.6668 3.33325 8.00016 3.33325Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button 
                        className="action-button edit-button"
                        title="Edit activity"
                        onClick={() => handleEditClick(activity)}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8.66683 3.99992L10.6668 5.99992M1.3335 14.6666H3.3335L11.3335 6.66659L9.3335 4.66659L1.3335 12.6666V14.6666Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="empty-table">
                    {selectedEntityId ? 
                      `No activities found for ${selectedEntityName}. Add a new activity or select a different organizational unit.` : 
                      'No activities found. Add a new activity to get started.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Add New Processing Activity</h2>
              <button onClick={() => setShowForm(false)} className="close-button">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="name">Activity Name*</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Enter activity name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description/Purpose*</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="form-textarea"
                  placeholder="Describe the purpose of this processing activity"
                  rows={3}
                />
              </div>
              
              <div className="form-group">
                <label>Categories of Personal Data*</label>
                <div className="checkbox-group">
                  {dataCategoryOptions.map(category => (
                    <div key={category} className="checkbox-item">
                      <input
                        type="checkbox"
                        id={`category-${category}`}
                        checked={formData.dataCategories.includes(category)}
                        onChange={() => handleCheckboxChange('dataCategories', category, 'form')}
                      />
                      <label htmlFor={`category-${category}`}>{category}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Data Subject Categories*</label>
                <div className="checkbox-group">
                  {dataSubjectOptions.map(subject => (
                    <div key={subject} className="checkbox-item">
                      <input
                        type="checkbox"
                        id={`subject-${subject}`}
                        checked={formData.dataSubjects.includes(subject)}
                        onChange={() => handleCheckboxChange('dataSubjects', subject, 'form')}
                      />
                      <label htmlFor={`subject-${subject}`}>{subject}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="legalBasis">Legal Basis for Processing*</label>
                <select
                  id="legalBasis"
                  name="legalBasis"
                  value={formData.legalBasis}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                >
                  <option value="">Select legal basis</option>
                  {legalBasisOptions.map(basis => (
                    <option key={basis} value={basis}>
                      {basis}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>IT Systems Involved*</label>
                <div className="checkbox-group">
                  {systems.map(system => (
                    <div key={system.id} className="checkbox-item">
                      <input
                        type="checkbox"
                        id={`system-${system.id}`}
                        checked={formData.systemIds.includes(system.id)}
                        onChange={() => handleCheckboxChange('systemIds', system.id, 'form')}
                      />
                      <label htmlFor={`system-${system.id}`}>{system.name}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="retentionPeriod">Data Retention Period*</label>
                <input
                  type="text"
                  id="retentionPeriod"
                  name="retentionPeriod"
                  value={formData.retentionPeriod}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="e.g., 5 years, 7 years after contract termination"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="recipients">Data Recipients</label>
                <input
                  type="text"
                  id="recipients"
                  name="recipients"
                  value={formData.recipients}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., Internal teams, Third-party processors"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="organizational_unit_id">Organizational Unit</label>
                <select
                  id="organizational_unit_id"
                  name="organizational_unit_id"
                  value={formData.organizational_unit_id}
                  onChange={handleInputChange}
                >
                  <option value="">Select an organizational unit</option>
                  {renderOrganizationalUnitOptions}
                </select>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditing && editData && (
        <EditModal
          title="Edit Processing Activity"
          isOpen={isEditing}
          onClose={handleEditCancel}
          onSave={handleEditSave}
        >
          <div className="form-group">
            <label htmlFor="edit-name">Activity Name*</label>
            <input
              type="text"
              id="edit-name"
              name="name"
              value={editData.name}
              onChange={handleEditChange}
              required
              className="form-input"
              placeholder="Enter activity name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="edit-description">Description/Purpose*</label>
            <textarea
              id="edit-description"
              name="description"
              value={editData.description}
              onChange={handleEditChange}
              required
              className="form-textarea"
              placeholder="Describe the purpose of this processing activity"
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label>Categories of Personal Data*</label>
            <div className="checkbox-group">
              {dataCategoryOptions.map(category => (
                <div key={category} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`edit-category-${category}`}
                    checked={editData.dataCategories.includes(category)}
                    onChange={() => handleCheckboxChange('dataCategories', category, 'edit')}
                  />
                  <label htmlFor={`edit-category-${category}`}>{category}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label>Data Subject Categories*</label>
            <div className="checkbox-group">
              {dataSubjectOptions.map(subject => (
                <div key={subject} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`edit-subject-${subject}`}
                    checked={editData.dataSubjects.includes(subject)}
                    onChange={() => handleCheckboxChange('dataSubjects', subject, 'edit')}
                  />
                  <label htmlFor={`edit-subject-${subject}`}>{subject}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="edit-legalBasis">Legal Basis for Processing*</label>
            <select
              id="edit-legalBasis"
              name="legalBasis"
              value={editData.legalBasis}
              onChange={handleEditChange}
              required
              className="form-select"
            >
              <option value="">Select legal basis</option>
              {legalBasisOptions.map(basis => (
                <option key={basis} value={basis}>
                  {basis}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>IT Systems Involved*</label>
            <div className="checkbox-group">
              {systems.map(system => (
                <div key={system.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`edit-system-${system.id}`}
                    checked={editData.systemIds.includes(system.id)}
                    onChange={() => handleCheckboxChange('systemIds', system.id, 'edit')}
                  />
                  <label htmlFor={`edit-system-${system.id}`}>{system.name}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="edit-retentionPeriod">Data Retention Period*</label>
            <input
              type="text"
              id="edit-retentionPeriod"
              name="retentionPeriod"
              value={editData.retentionPeriod}
              onChange={handleEditChange}
              required
              className="form-input"
              placeholder="e.g., 5 years, 7 years after contract termination"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="edit-recipients">Data Recipients</label>
            <input
              type="text"
              id="edit-recipients"
              name="recipients"
              value={editData.recipients}
              onChange={handleEditChange}
              className="form-input"
              placeholder="e.g., Internal teams, Third-party processors"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="edit-organizational_unit_id">Organizational Unit</label>
            <select
              id="edit-organizational_unit_id"
              name="organizational_unit_id"
              value={editData.organizational_unit_id || ''}
              onChange={handleEditChange}
            >
              <option value="">Select an organizational unit</option>
              {renderOrganizationalUnitOptions}
            </select>
          </div>
        </EditModal>
      )}

      {uploadError.length > 0 && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Upload Errors</h2>
              <button onClick={() => setUploadError([])} className="close-button">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="modal-content">
              <div className="error-list">
                {uploadError.map((error, index) => (
                  <div key={index} className="error-item">
                    {error}
                  </div>
                ))}
              </div>
              <div className="modal-actions">
                <button onClick={() => setUploadError([])} className="close-button">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities; 