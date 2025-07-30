import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/modules.css';

interface Organization {
  id: string;
  name: string;
  description: string;
  address: string;
  country: string;
  industry: string;
  primary_contact: string;
  primary_email: string;
  phone: string;
  website: string;
}

interface OrganizationalUnit {
  id: string;
  name: string;
  unit_type: 'SUBSIDIARY' | 'DEPARTMENT';
  description: string;
  organization_id: string;
  parent_unit_id: string | null;
  address: string;
  contact_person: string;
  contact_email: string;
  phone: string;
}

const OrganizationInfo: React.FC = () => {
  const navigate = useNavigate();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [organizationalUnits, setOrganizationalUnits] = useState<OrganizationalUnit[]>([]);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUnit, setCurrentUnit] = useState<OrganizationalUnit | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  
  // Form state for organization
  const [orgForm, setOrgForm] = useState<Organization>({
    id: '',
    name: '',
    description: '',
    address: '',
    country: '',
    industry: '',
    primary_contact: '',
    primary_email: '',
    phone: '',
    website: ''
  });
  
  // Form state for organizational unit
  const [unitForm, setUnitForm] = useState<OrganizationalUnit>({
    id: '',
    name: '',
    unit_type: 'SUBSIDIARY',
    description: '',
    organization_id: '',
    parent_unit_id: null,
    address: '',
    contact_person: '',
    contact_email: '',
    phone: ''
  });

  useEffect(() => {
    // First try to load from dedicated organization storage
    const savedOrg = localStorage.getItem('organization');
    if (savedOrg) {
      const parsedOrg = JSON.parse(savedOrg);
      setOrganization(parsedOrg);
      setOrgForm(parsedOrg);
    } else {
      // If no dedicated organization data, try to get it from user account info
      const currentUserJson = localStorage.getItem('currentUser');
      if (currentUserJson) {
        const currentUser = JSON.parse(currentUserJson);
        
        // Create an organization object from user info
        if (currentUser.organizationName) {
          const orgFromUser: Organization = {
            id: currentUser.organizationId || Date.now().toString(),
            name: currentUser.organizationName || '',
            description: currentUser.organizationDescription || '',
            address: currentUser.organizationAddress || '',
            country: currentUser.organizationCountry || '',
            industry: currentUser.organizationIndustry || '',
            primary_contact: currentUser.name || '',
            primary_email: currentUser.email || '',
            phone: currentUser.organizationPhone || '',
            website: currentUser.organizationWebsite || ''
          };
          
          setOrganization(orgFromUser);
          setOrgForm(orgFromUser);
          
          // Save this to the organization storage for future use
          localStorage.setItem('organization', JSON.stringify(orgFromUser));
        }
      }
    }
    
    // Load organizational units from localStorage
    const savedUnits = localStorage.getItem('organizationalUnits');
    if (savedUnits) {
      setOrganizationalUnits(JSON.parse(savedUnits));
    }
  }, []);

  // Save changes to localStorage whenever data changes
  useEffect(() => {
    if (organization) {
      localStorage.setItem('organization', JSON.stringify(organization));
      
      // Also update user object to keep data in sync
      const currentUserJson = localStorage.getItem('currentUser');
      if (currentUserJson) {
        const currentUser = JSON.parse(currentUserJson);
        const updatedUser = {
          ...currentUser,
          organizationId: organization.id,
          organizationName: organization.name,
          organizationAddress: organization.address,
          organizationCountry: organization.country,
          organizationIndustry: organization.industry,
          organizationPhone: organization.phone,
          organizationWebsite: organization.website
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    }
    
    if (organizationalUnits.length > 0) {
      localStorage.setItem('organizationalUnits', JSON.stringify(organizationalUnits));
    }
  }, [organization, organizationalUnits]);

  const handleOrgFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOrgForm({
      ...orgForm,
      [name]: value
    });
  };
  
  const handleUnitFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUnitForm({
      ...unitForm,
      [name]: value
    });
  };

  const saveOrganization = () => {
    setOrganization(orgForm);
    setShowOrgModal(false);
  };
  
  const saveOrganizationalUnit = () => {
    if (isEditMode && currentUnit) {
      // Update existing unit
      setOrganizationalUnits(prevUnits => 
        prevUnits.map(unit => unit.id === currentUnit.id ? unitForm : unit)
      );
    } else {
      // Create new unit with a generated ID
      const newUnit = {
        ...unitForm,
        id: Date.now().toString(),
        organization_id: organization?.id || ''
      };
      setOrganizationalUnits(prevUnits => [...prevUnits, newUnit]);
    }
    
    setShowUnitModal(false);
    setCurrentUnit(null);
    resetUnitForm();
  };
  
  const resetUnitForm = () => {
    setUnitForm({
      id: '',
      name: '',
      unit_type: 'SUBSIDIARY',
      description: '',
      organization_id: organization?.id || '',
      parent_unit_id: null,
      address: '',
      contact_person: '',
      contact_email: '',
      phone: ''
    });
    setIsEditMode(false);
  };
  
  const editUnit = (unit: OrganizationalUnit) => {
    setCurrentUnit(unit);
    setUnitForm(unit);
    setIsEditMode(true);
    setShowUnitModal(true);
  };
  
  const deleteUnit = (unitId: string) => {
    // Find all child units recursively
    const findAllChildren = (id: string): string[] => {
      const directChildren = organizationalUnits.filter(u => u.parent_unit_id === id);
      return [
        id,
        ...directChildren.flatMap(child => findAllChildren(child.id))
      ];
    };
    
    const unitsToDelete = findAllChildren(unitId);
    
    // Remove all units that have this unit as a parent (or any child units)
    setOrganizationalUnits(prevUnits => 
      prevUnits.filter(unit => !unitsToDelete.includes(unit.id))
    );
  };
  
  const addNewUnit = (parentId: string | null = null, type: 'SUBSIDIARY' | 'DEPARTMENT' = 'SUBSIDIARY') => {
    setUnitForm({
      ...unitForm,
      unit_type: type,
      parent_unit_id: parentId
    });
    setIsEditMode(false);
    setShowUnitModal(true);
  };
  
  const toggleExpand = (unitId: string) => {
    setExpandedUnits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(unitId)) {
        newSet.delete(unitId);
      } else {
        newSet.add(unitId);
      }
      return newSet;
    });
  };
  
  // Filter units to get subsidiaries (units with no parent)
  const getTopLevelSubsidiaries = () => {
    return organizationalUnits.filter(unit => 
      unit.unit_type === 'SUBSIDIARY' && !unit.parent_unit_id
    );
  };
  
  // Filter units to get departments directly under the organization (not under any subsidiary)
  const getTopLevelDepartments = () => {
    return organizationalUnits.filter(unit => 
      unit.unit_type === 'DEPARTMENT' && !unit.parent_unit_id
    );
  };
  
  // Get child units of a specific parent
  const getChildUnits = (parentId: string) => {
    return organizationalUnits.filter(unit => unit.parent_unit_id === parentId);
  };
  
  // Modified renderOrganizationalUnit function to include tooltips for hover information
  const renderOrganizationalUnit = (unit: OrganizationalUnit) => {
    const childUnits = getChildUnits(unit.id);
    const isExpanded = expandedUnits.has(unit.id);
    
    return (
      <div key={unit.id} className="org-unit-item">
        <div className="org-unit-header">
          <div className="org-unit-expand-icon" onClick={() => toggleExpand(unit.id)}>
            {childUnits.length > 0 && (
              <span>{isExpanded ? '▼' : '▶'}</span>
            )}
          </div>
          
          <div className="org-unit-type-icon">
            {unit.unit_type === 'SUBSIDIARY' ? 
              <span className="subsidiary-icon">🏢</span> : 
              <span className="department-icon">🔹</span>
            }
          </div>
          
          <div className="org-unit-title">{unit.name}</div>
          
          <div className="org-unit-actions">
            <button 
              className="org-unit-button" 
              onClick={() => addNewUnit(unit.id, 'DEPARTMENT')}
              aria-label="Add department"
            >
              + Dept
            </button>
            {unit.unit_type === 'SUBSIDIARY' && (
              <button 
                className="org-unit-button"
                onClick={() => addNewUnit(unit.id, 'SUBSIDIARY')}
                aria-label="Add subsidiary"
              >
                + Sub
              </button>
            )}
            <button 
              className="org-unit-button edit"
              onClick={() => editUnit(unit)}
              aria-label="Edit"
            >
              Edit
            </button>
            <button 
              className="org-unit-button delete"
              onClick={() => deleteUnit(unit.id)}
              aria-label="Delete"
            >
              Delete
            </button>
          </div>
        </div>
        
        {/* Tooltip with details on hover */}
        <div className="org-unit-detail-tooltip">
          <div><strong>Type:</strong> {unit.unit_type}</div>
          {unit.description && <div><strong>Description:</strong> {unit.description}</div>}
          {unit.address && <div><strong>Address:</strong> {unit.address}</div>}
          {unit.contact_person && <div><strong>Contact:</strong> {unit.contact_person}</div>}
          {unit.contact_email && <div><strong>Email:</strong> {unit.contact_email}</div>}
          {unit.phone && <div><strong>Phone:</strong> {unit.phone}</div>}
        </div>
        
        {isExpanded && childUnits.length > 0 && (
          <div className="org-unit-children">
            {childUnits.map(childUnit => renderOrganizationalUnit(childUnit))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div className="header-content">
          <div className="header-title">
            <button className="back-button" onClick={() => navigate('/dashboard')}>
              <span>←</span> Back to Dashboard
            </button>
            <h1>Organizational Information</h1>
          </div>
          
          <div className="header-actions">
            <button className="add-button" onClick={() => setShowOrgModal(true)}>
              {organization ? 'Edit Organization' : 'Add Organization'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="module-content">
        {organization ? (
          <div className="org-structure-container">
            <div className="org-main-card">
              <div className="org-main-header">
                <h2>{organization.name}</h2>
                <span className="org-industry-badge">{organization.industry}</span>
              </div>
              
              <div className="org-details">
                <div className="org-detail-column">
                  <div className="org-detail-item">
                    <span className="detail-label">Description</span>
                    <span className="detail-value">{organization.description}</span>
                  </div>
                  <div className="org-detail-item">
                    <span className="detail-label">Address</span>
                    <span className="detail-value">{organization.address}</span>
                  </div>
                  <div className="org-detail-item">
                    <span className="detail-label">Country</span>
                    <span className="detail-value">{organization.country}</span>
                  </div>
                </div>
                
                <div className="org-detail-column">
                  <div className="org-detail-item">
                    <span className="detail-label">Primary Contact</span>
                    <span className="detail-value">{organization.primary_contact}</span>
                  </div>
                  <div className="org-detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{organization.primary_email}</span>
                  </div>
                  <div className="org-detail-item">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{organization.phone}</span>
                  </div>
                  <div className="org-detail-item">
                    <span className="detail-label">Website</span>
                    <span className="detail-value">{organization.website}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="org-hierarchy-section">
              <div className="org-hierarchy-header">
                <h3>Organizational Structure</h3>
                <div className="org-hierarchy-actions">
                  <button 
                    className="add-button" 
                    onClick={() => addNewUnit(null, 'SUBSIDIARY')}
                  >
                    Add Subsidiary
                  </button>
                  <button 
                    className="add-button" 
                    onClick={() => addNewUnit(null, 'DEPARTMENT')}
                  >
                    Add Department
                  </button>
                </div>
              </div>
              
              <div className="org-hierarchy-diagram">
                <div className="org-hierarchy-root">
                  <div className="org-root-node">
                    <span className="org-root-icon">🏢</span>
                    <span className="org-root-name">{organization.name}</span>
                  </div>
                  
                  {/* Display top-level units */}
                  <div className="org-hierarchy-units">
                    {getTopLevelSubsidiaries().map(unit => renderOrganizationalUnit(unit))}
                    {getTopLevelDepartments().map(unit => renderOrganizationalUnit(unit))}
                  </div>
                  
                  {organizationalUnits.length === 0 && (
                    <div className="org-empty-state">
                      <p>No subsidiaries or departments have been added yet.</p>
                      <p>Use the buttons above to add your organizational structure.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="org-empty-container">
            <div className="org-empty-message">
              <h2>No Organization Information</h2>
              <p>Please add your organization details to get started.</p>
              <button className="add-button" onClick={() => setShowOrgModal(true)}>
                Add Organization
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Organization Modal */}
      {showOrgModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>{organization ? 'Edit Organization' : 'Add Organization'}</h2>
              <button className="close-button" onClick={() => setShowOrgModal(false)}>×</button>
            </div>
            
            <div className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Organization Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-input"
                    value={orgForm.name}
                    onChange={handleOrgFormChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="industry">Industry</label>
                  <input
                    type="text"
                    id="industry"
                    name="industry"
                    className="form-input"
                    value={orgForm.industry}
                    onChange={handleOrgFormChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-textarea"
                  value={orgForm.description}
                  onChange={handleOrgFormChange}
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  className="form-textarea"
                  value={orgForm.address}
                  onChange={handleOrgFormChange}
                ></textarea>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    className="form-input"
                    value={orgForm.country}
                    onChange={handleOrgFormChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="website">Website</label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    className="form-input"
                    value={orgForm.website}
                    onChange={handleOrgFormChange}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="primary_contact">Primary Contact</label>
                  <input
                    type="text"
                    id="primary_contact"
                    name="primary_contact"
                    className="form-input"
                    value={orgForm.primary_contact}
                    onChange={handleOrgFormChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="primary_email">Email</label>
                  <input
                    type="email"
                    id="primary_email"
                    name="primary_email"
                    className="form-input"
                    value={orgForm.primary_email}
                    onChange={handleOrgFormChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-input"
                  value={orgForm.phone}
                  onChange={handleOrgFormChange}
                />
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setShowOrgModal(false)}>
                  Cancel
                </button>
                <button type="button" className="submit-button" onClick={saveOrganization}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Organizational Unit Modal */}
      {showUnitModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>
                {isEditMode 
                  ? `Edit ${currentUnit?.unit_type === 'SUBSIDIARY' ? 'Subsidiary' : 'Department'}` 
                  : `Add ${unitForm.unit_type === 'SUBSIDIARY' ? 'Subsidiary' : 'Department'}`}
              </h2>
              <button className="close-button" onClick={() => setShowUnitModal(false)}>×</button>
            </div>
            
            <div className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="unit-name">Name</label>
                  <input
                    type="text"
                    id="unit-name"
                    name="name"
                    className="form-input"
                    value={unitForm.name}
                    onChange={handleUnitFormChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="unit-type">Type</label>
                  <select
                    id="unit-type"
                    name="unit_type"
                    className="form-select"
                    value={unitForm.unit_type}
                    onChange={handleUnitFormChange}
                  >
                    <option value="SUBSIDIARY">Subsidiary</option>
                    <option value="DEPARTMENT">Department</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="unit-parent">Parent Unit</label>
                <select
                  id="unit-parent"
                  name="parent_unit_id"
                  className="form-select"
                  value={unitForm.parent_unit_id || ''}
                  onChange={handleUnitFormChange}
                >
                  <option value="">None (Top Level)</option>
                  {organizationalUnits.map(unit => (
                    // Don't allow a unit to be its own parent or child of its children
                    unit.id !== currentUnit?.id && 
                    (!currentUnit || !getChildUnits(currentUnit.id).some(child => child.id === unit.id)) && (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.unit_type === 'SUBSIDIARY' ? 'Subsidiary' : 'Department'})
                      </option>
                    )
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="unit-description">Description</label>
                <textarea
                  id="unit-description"
                  name="description"
                  className="form-textarea"
                  value={unitForm.description}
                  onChange={handleUnitFormChange}
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="unit-address">Address</label>
                <textarea
                  id="unit-address"
                  name="address"
                  className="form-textarea"
                  value={unitForm.address}
                  onChange={handleUnitFormChange}
                ></textarea>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="unit-contact">Contact Person</label>
                  <input
                    type="text"
                    id="unit-contact"
                    name="contact_person"
                    className="form-input"
                    value={unitForm.contact_person}
                    onChange={handleUnitFormChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="unit-email">Contact Email</label>
                  <input
                    type="email"
                    id="unit-email"
                    name="contact_email"
                    className="form-input"
                    value={unitForm.contact_email}
                    onChange={handleUnitFormChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="unit-phone">Phone</label>
                <input
                  type="tel"
                  id="unit-phone"
                  name="phone"
                  className="form-input"
                  value={unitForm.phone}
                  onChange={handleUnitFormChange}
                />
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setShowUnitModal(false)}>
                  Cancel
                </button>
                <button type="button" className="submit-button" onClick={saveOrganizationalUnit}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Database Schema for Organization Hierarchy (Production Implementation)
/* 
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,
    country VARCHAR(100),
    industry VARCHAR(100),
    primary_contact VARCHAR(255),
    primary_email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE organizational_units (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    unit_type VARCHAR(50) NOT NULL CHECK (unit_type IN ('SUBSIDIARY', 'DEPARTMENT')),
    description TEXT,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_unit_id INTEGER REFERENCES organizational_units(id) ON DELETE CASCADE,
    address TEXT,
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_org_units_parent ON organizational_units(parent_unit_id);
CREATE INDEX idx_org_units_organization ON organizational_units(organization_id);

-- Schema extensions for integration with other modules:

-- Linking to Processing Activities
ALTER TABLE processing_activities ADD COLUMN organizational_unit_id INTEGER REFERENCES organizational_units(id);

-- Linking to Risk Assessments
ALTER TABLE risk_assessments ADD COLUMN organizational_unit_id INTEGER REFERENCES organizational_units(id);

-- Linking to Systems/Vendors
ALTER TABLE systems ADD COLUMN organizational_unit_id INTEGER REFERENCES organizational_units(id);
ALTER TABLE vendors ADD COLUMN primary_organizational_unit_id INTEGER REFERENCES organizational_units(id);

-- Junction table for many-to-many relationships
CREATE TABLE vendor_organizational_units (
    vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
    organizational_unit_id INTEGER REFERENCES organizational_units(id) ON DELETE CASCADE,
    PRIMARY KEY (vendor_id, organizational_unit_id)
);
*/

export default OrganizationInfo; 