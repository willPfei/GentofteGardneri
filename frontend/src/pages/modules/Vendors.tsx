import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { downloadTemplate, parseCSV, Vendor, Certification } from '../../utils/csvUtils';
import EditModal from '../../components/EditModal';
import '../../styles/modules.css';
import { useOrganization } from '../../context/OrganizationContext';
import OrganizationSelector from '../../components/OrganizationSelector';
import { vendorsApi } from '../../utils/apiService';

// Extend the Vendor interface to include organizational unit
interface ExtendedVendor extends Vendor {
  organizational_unit_id?: string;
  organizational_unit_name?: string;
}

// Initial mock data
const initialVendors: ExtendedVendor[] = [
  {
    id: 'v001',
    name: 'Microsoft Corporation',
    contactName: 'John Smith',
    contactEmail: 'john.smith@microsoft.com',
    phone: '+1-425-555-0100',
    address: 'One Microsoft Way, Redmond, WA 98052',
    description: 'Cloud services and software provider',
    dataProtectionOfficer: 'dpo@microsoft.com',
    countryOfOperation: 'United States',
    privacyPolicy: 'https://privacy.microsoft.com',
    certifications: [],
    organizational_unit_id: ''
  },
  {
    id: 'v002',
    name: 'Salesforce Inc.',
    contactName: 'Sarah Johnson',
    contactEmail: 'sarah.johnson@salesforce.com',
    phone: '+1-415-555-0200',
    address: '415 Mission St, San Francisco, CA 94105',
    description: 'CRM and cloud computing solutions',
    dataProtectionOfficer: 'privacy@salesforce.com',
    countryOfOperation: 'United States',
    privacyPolicy: 'https://www.salesforce.com/privacy',
    certifications: [],
    organizational_unit_id: ''
  },
  {
    id: 'v003',
    name: 'Amazon Web Services',
    contactName: 'Michael Brown',
    contactEmail: 'michael.brown@aws.amazon.com',
    phone: '+1-206-555-0300',
    address: '410 Terry Ave N, Seattle, WA 98109',
    description: 'Cloud computing and hosting services',
    dataProtectionOfficer: 'aws-dpo@amazon.com',
    countryOfOperation: 'United States',
    privacyPolicy: 'https://aws.amazon.com/privacy',
    certifications: [],
    organizational_unit_id: ''
  }
];

const Vendors: React.FC = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<ExtendedVendor[]>(initialVendors);
  const [filteredVendors, setFilteredVendors] = useState<ExtendedVendor[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof ExtendedVendor>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showUploadError, setShowUploadError] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  // Form state
  const [formData, setFormData] = useState<Omit<ExtendedVendor, 'id'>>({
    name: '',
    contactName: '',
    contactEmail: '',
    phone: '',
    address: '',
    description: '',
    dataProtectionOfficer: '',
    countryOfOperation: '',
    privacyPolicy: '',
    certifications: [],
    organizational_unit_id: ''
  });

  // Edit state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Omit<ExtendedVendor, 'id'>>({
    name: '',
    contactName: '',
    contactEmail: '',
    phone: '',
    address: '',
    description: '',
    dataProtectionOfficer: '',
    countryOfOperation: '',
    privacyPolicy: '',
    certifications: [],
    organizational_unit_id: ''
  });
  
  // Form state for certifications
  const [certificationForm, setCertificationForm] = useState<Certification>({
    name: '',
    issueDate: '',
    expiryDate: '',
    certificationBody: '',
    scope: ''
  });

  // Load data
  useEffect(() => {
    // Load organization data
    loadOrganizationData();
    
    // Load vendors from API
    const loadVendors = async () => {
      try {
        const loadedVendors = await vendorsApi.getAll();
        setVendors(loadedVendors);
      } catch (error) {
        console.error('Failed to load vendors:', error);
        // Fallback to initial data if API fails
        setVendors(initialVendors);
      }
    };
    
    loadVendors();
  }, [loadOrganizationData]);

  // Filter vendors based on selected entity
  useEffect(() => {
    let filtered = [...vendors];
    
    // Apply organization filter if selected
    if (selectedEntityId) {
      filtered = filtered.filter(vendor => 
        vendor.organizational_unit_id === selectedEntityId || 
        isChildOfSelectedEntity(vendor.organizational_unit_id)
      );
    }
    
    // Apply search term filter if present
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(vendor =>
        vendor.name.toLowerCase().includes(search) ||
        (vendor.description && vendor.description.toLowerCase().includes(search)) ||
        (vendor.contactName && vendor.contactName.toLowerCase().includes(search))
      );
    }
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortField]?.toString().toLowerCase() || '';
      const bValue = b[sortField]?.toString().toLowerCase() || '';
      
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
    
    setFilteredVendors(sorted);
  }, [vendors, selectedEntityId, searchTerm, sortField, sortDirection, isChildOfSelectedEntity]);

  // When vendors change, save to localStorage
  useEffect(() => {
    localStorage.setItem('ropa_vendors', JSON.stringify(vendors));
  }, [vendors]);
  
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };
  
  const handleSort = (field: keyof ExtendedVendor) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get the organizational unit name
    let orgUnitName = '';
    if (formData.organizational_unit_id) {
      orgUnitName = getEntityName(formData.organizational_unit_id);
    }
    
    try {
      const newVendorData = {
        ...formData,
        organizational_unit_name: orgUnitName
      };
      
      const newVendor = await vendorsApi.create(newVendorData);
      setVendors(prev => [...prev, newVendor]);
      
      // Reset form
      setFormData({
        name: '',
        contactName: '',
        contactEmail: '',
        phone: '',
        address: '',
        description: '',
        dataProtectionOfficer: '',
        countryOfOperation: '',
        privacyPolicy: '',
        certifications: [],
        organizational_unit_id: ''
      });
      
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating vendor:', error);
      alert('Failed to create vendor. Please try again.');
    }
  };
  
  const handleViewSystems = (vendorId: string) => {
    navigate(`/modules/systems?vendorId=${vendorId}`);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      try {
        const parsedData = parseCSV(text, 'vendors');
        setVendors(prev => [...prev, ...parsedData]);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        if (error instanceof Error) {
          setShowUploadError(error.message.split('\n'));
        } else {
          setShowUploadError(['An unknown error occurred while processing the CSV file']);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleEditClick = (vendor: ExtendedVendor) => {
    setEditId(vendor.id);
    setEditData({
      name: vendor.name,
      contactName: vendor.contactName,
      contactEmail: vendor.contactEmail,
      phone: vendor.phone,
      address: vendor.address,
      description: vendor.description,
      dataProtectionOfficer: vendor.dataProtectionOfficer,
      countryOfOperation: vendor.countryOfOperation,
      privacyPolicy: vendor.privacyPolicy,
      certifications: vendor.certifications || [],
      organizational_unit_id: vendor.organizational_unit_id || ''
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    if (editId) {
      // Get the organizational unit name
      let orgUnitName = '';
      if (editData.organizational_unit_id) {
        orgUnitName = getEntityName(editData.organizational_unit_id);
      }
      
      try {
        const updatedVendorData = {
          ...editData,
          organizational_unit_name: orgUnitName
        };
        
        await vendorsApi.update(editId, updatedVendorData);
        
        // Update local state
        const updatedVendors = vendors.map(vendor => {
          if (vendor.id === editId) {
            return { ...updatedVendorData, id: editId };
          }
          return vendor;
        });
        
        setVendors(updatedVendors);
        setShowEditModal(false);
        setEditId(null);
      } catch (error) {
        console.error('Error updating vendor:', error);
        alert('Failed to update vendor. Please try again.');
      }
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditId(null);
    setEditData({
      name: '',
      contactName: '',
      contactEmail: '',
      phone: '',
      address: '',
      description: '',
      dataProtectionOfficer: '',
      countryOfOperation: '',
      privacyPolicy: '',
      certifications: [],
      organizational_unit_id: ''
    });
  };

  const handleCertificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditData(prev => ({
      ...prev,
      certifications: [...(prev.certifications || []), certificationForm]
    }));
    setCertificationForm({
      name: '',
      issueDate: '',
      expiryDate: '',
      certificationBody: '',
      scope: ''
    });
  };

  const handleRemoveCertification = (index: number) => {
    setEditData(prev => ({
      ...prev,
      certifications: prev.certifications?.filter((_, i) => i !== index) || []
    }));
  };

  // Handle vendor deletion
  const handleDeleteVendor = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this vendor?');
    if (confirmed) {
      try {
        await vendorsApi.delete(id);
        const updatedVendors = vendors.filter(vendor => vendor.id !== id);
        setVendors(updatedVendors);
      } catch (error) {
        console.error('Error deleting vendor:', error);
        alert('Failed to delete vendor. Please try again.');
      }
    }
  };

  // Render organizational unit options for select dropdown
  const renderOrganizationalUnitOptions = () => {
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
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          <span className="back-icon">←</span> Back to Dashboard
        </button>
        <h2>Vendor Management</h2>
        <div className="module-actions">
          <OrganizationSelector />
          <button className="primary-button" onClick={() => setShowAddModal(true)}>
            + Add Vendor
          </button>
        </div>
      </div>

      <main className="module-content">
        <section className="search-section">
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </section>

        <section className="table-section">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}>
                  Vendor Name
                  {sortField === 'name' && (
                    <span className="sort-indicator">{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                  )}
                </th>
                <th onClick={() => handleSort('contactName')}>
                  Contact Person
                  {sortField === 'contactName' && (
                    <span className="sort-indicator">{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                  )}
                </th>
                <th onClick={() => handleSort('dataProtectionOfficer')}>
                  DPO
                  {sortField === 'dataProtectionOfficer' && (
                    <span className="sort-indicator">{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                  )}
                </th>
                <th onClick={() => handleSort('organizational_unit_name')}>
                  Organizational Unit
                  {sortField === 'organizational_unit_name' && (
                    <span className="sort-indicator">{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                  )}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.length > 0 ? (
                filteredVendors.map(vendor => (
                  <tr key={vendor.id}>
                    <td>{vendor.name}</td>
                    <td>{vendor.contactName}</td>
                    <td>{vendor.dataProtectionOfficer}</td>
                    <td>{vendor.organizational_unit_name || 'Not assigned'}</td>
                    <td className="actions-cell">
                      <button
                        className="action-button edit"
                        onClick={() => handleEditClick(vendor)}
                      >
                        Edit
                      </button>
                      <button
                        className="action-button delete"
                        onClick={() => handleDeleteVendor(vendor.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="empty-table-message">
                    {selectedEntityId 
                      ? `No vendors found for ${selectedEntityName}. Add a new vendor or select a different organizational unit.` 
                      : 'No vendors found. Add a new vendor to get started.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {showUploadError.length > 0 && (
          <section className="error-section">
            <div className="error-message">
              <h4>Upload Errors:</h4>
              <ul>
                {showUploadError.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal add-vendor-modal">
            <div className="modal-header">
              <h2>Add New Vendor</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="close-button"
                aria-label="Close modal"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSaveVendor} className="modal-form">
              <div className="form-sections">
                <div className="form-section">
                  <h3>Basic Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Vendor Name*</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter vendor name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="description">Description*</label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        placeholder="Brief description of vendor services"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Contact Details</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="contactName">Contact Name*</label>
                      <input
                        type="text"
                        id="contactName"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        required
                        placeholder="Full name of contact person"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="contactEmail">Contact Email*</label>
                      <input
                        type="email"
                        id="contactEmail"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        required
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number*</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="+1 (234) 567-8900"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="address">Address*</label>
                      <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        placeholder="Full business address"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Compliance Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="dataProtectionOfficer">Data Protection Officer*</label>
                      <input
                        type="text"
                        id="dataProtectionOfficer"
                        name="dataProtectionOfficer"
                        value={formData.dataProtectionOfficer}
                        onChange={handleInputChange}
                        required
                        placeholder="Name or email of DPO"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="countryOfOperation">Country of Operation*</label>
                      <input
                        type="text"
                        id="countryOfOperation"
                        name="countryOfOperation"
                        value={formData.countryOfOperation}
                        onChange={handleInputChange}
                        required
                        placeholder="Primary country of operation"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group full-width">
                      <label htmlFor="privacyPolicy">Privacy Policy URL*</label>
                      <input
                        type="url"
                        id="privacyPolicy"
                        name="privacyPolicy"
                        value={formData.privacyPolicy}
                        onChange={handleInputChange}
                        required
                        placeholder="https://example.com/privacy"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="organizational_unit_id">Organizational Unit</label>
                    <select
                      id="organizational_unit_id"
                      name="organizational_unit_id"
                      className="form-select"
                      value={formData.organizational_unit_id}
                      onChange={handleInputChange}
                    >
                      <option value="">Select an organizational unit</option>
                      {renderOrganizationalUnitOptions()}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="secondary-button">
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Add Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <EditModal
        isOpen={showEditModal}
        onClose={handleCancelEdit}
        onSave={handleEditSave}
        title="Edit Vendor"
      >
        <div className="form-group">
          <label htmlFor="edit-name">Vendor Name</label>
          <input
            id="edit-name"
            name="name"
            value={editData.name}
            onChange={handleEditChange}
            placeholder="Enter vendor name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="edit-contactName">Contact Name</label>
          <input
            id="edit-contactName"
            name="contactName"
            value={editData.contactName}
            onChange={handleEditChange}
            placeholder="Enter contact name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="edit-contactEmail">Contact Email</label>
          <input
            id="edit-contactEmail"
            name="contactEmail"
            type="email"
            value={editData.contactEmail}
            onChange={handleEditChange}
            placeholder="Enter contact email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="edit-phone">Phone</label>
          <input
            id="edit-phone"
            name="phone"
            type="tel"
            value={editData.phone}
            onChange={handleEditChange}
            placeholder="Enter phone number"
          />
        </div>
        <div className="form-group">
          <label htmlFor="edit-address">Address</label>
          <textarea
            id="edit-address"
            name="address"
            value={editData.address}
            onChange={handleEditChange}
            placeholder="Enter address"
          />
        </div>
        <div className="form-group">
          <label htmlFor="edit-description">Description</label>
          <textarea
            id="edit-description"
            name="description"
            value={editData.description}
            onChange={handleEditChange}
            placeholder="Enter description"
          />
        </div>
        <div className="form-group">
          <label htmlFor="edit-dataProtectionOfficer">Data Protection Officer</label>
          <input
            id="edit-dataProtectionOfficer"
            name="dataProtectionOfficer"
            value={editData.dataProtectionOfficer}
            onChange={handleEditChange}
            placeholder="Enter DPO contact"
          />
        </div>
        <div className="form-group">
          <label htmlFor="edit-countryOfOperation">Country of Operation</label>
          <input
            id="edit-countryOfOperation"
            name="countryOfOperation"
            value={editData.countryOfOperation}
            onChange={handleEditChange}
            placeholder="Enter country"
          />
        </div>
        <div className="form-group">
          <label htmlFor="edit-privacyPolicy">Privacy Policy URL</label>
          <input
            id="edit-privacyPolicy"
            name="privacyPolicy"
            type="url"
            value={editData.privacyPolicy}
            onChange={handleEditChange}
            placeholder="Enter privacy policy URL"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="edit-organizational_unit_id">Organizational Unit</label>
            <select
              id="edit-organizational_unit_id"
              name="organizational_unit_id"
              className="form-select"
              value={editData.organizational_unit_id}
              onChange={handleEditChange}
            >
              <option value="">Select an organizational unit</option>
              {renderOrganizationalUnitOptions()}
            </select>
          </div>
        </div>
        
        <div className="certifications-section">
          <h3>Certifications</h3>
          <div className="certifications-list">
            {editData.certifications?.map((cert, index) => (
              <div key={index} className="certification-item">
                <div className="certification-header">
                  <h4>{cert.name}</h4>
                  <button
                    type="button"
                    onClick={() => handleRemoveCertification(index)}
                    className="remove-button"
                  >
                    Remove
                  </button>
                </div>
                <div className="certification-details">
                  <p><strong>Certification Body:</strong> {cert.certificationBody}</p>
                  <p><strong>Issue Date:</strong> {cert.issueDate}</p>
                  <p><strong>Expiry Date:</strong> {cert.expiryDate}</p>
                  <p><strong>Scope:</strong> {cert.scope}</p>
                </div>
              </div>
            ))}
          </div>
          
          <form onSubmit={handleCertificationSubmit} className="certification-form">
            <h4>Add New Certification</h4>
            <div className="form-group">
              <label htmlFor="cert-name">Certification Name</label>
              <input
                id="cert-name"
                name="name"
                value={certificationForm.name}
                onChange={(e) => setCertificationForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., ISO 27001"
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cert-issue-date">Issue Date</label>
                <input
                  id="cert-issue-date"
                  type="date"
                  name="issueDate"
                  value={certificationForm.issueDate}
                  onChange={(e) => setCertificationForm(prev => ({ ...prev, issueDate: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="cert-expiry-date">Expiry Date</label>
                <input
                  id="cert-expiry-date"
                  type="date"
                  name="expiryDate"
                  value={certificationForm.expiryDate}
                  onChange={(e) => setCertificationForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="cert-body">Certification Body</label>
              <input
                id="cert-body"
                name="certificationBody"
                value={certificationForm.certificationBody}
                onChange={(e) => setCertificationForm(prev => ({ ...prev, certificationBody: e.target.value }))}
                placeholder="e.g., BSI"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="cert-scope">Scope</label>
              <textarea
                id="cert-scope"
                name="scope"
                value={certificationForm.scope}
                onChange={(e) => setCertificationForm(prev => ({ ...prev, scope: e.target.value }))}
                placeholder="Enter the scope of certification"
                required
              />
            </div>
            <button type="submit" className="primary-button">Add Certification</button>
          </form>
        </div>
      </EditModal>

      <style>
        {`
        .certifications-section {
          margin-top: 2rem;
          border-top: 1px solid var(--border-color);
          padding-top: 1rem;
        }

        .certifications-list {
          margin-bottom: 1.5rem;
        }

        .certification-item {
          background-color: var(--background-color);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .certification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .certification-header h4 {
          margin: 0;
        }

        .remove-button {
          background: none;
          border: none;
          color: var(--error-color);
          cursor: pointer;
          font-size: 0.875rem;
        }

        .certification-details {
          font-size: 0.875rem;
        }

        .certification-details p {
          margin: 0.25rem 0;
        }

        .certification-form {
          background-color: var(--background-color);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 1rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.75);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(8px);
        }

        .add-vendor-modal {
          background: var(--apple-card-background, #3A3A3C);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 0;
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
          position: sticky;
          top: 0;
          background: var(--apple-card-background, #3A3A3C);
          z-index: 1;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: var(--text-color, #FFFFFF);
        }

        .close-button {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          padding: 0.5rem;
          cursor: pointer;
          color: var(--text-color-secondary, #C7C7CC);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .close-button:hover {
          background-color: rgba(255, 255, 255, 0.2);
          color: var(--text-color, #FFFFFF);
        }

        .modal-form {
          padding: 2rem;
          background: var(--apple-card-background, #3A3A3C);
        }

        .form-sections {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .form-section {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
          border-radius: 8px;
          padding: 1.5rem;
        }

        .form-section h3 {
          margin: 0 0 1.5rem 0;
          font-size: 1.1rem;
          color: var(--text-color, #FFFFFF);
          font-weight: 600;
        }

        .form-group label {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-color-secondary, #C7C7CC);
        }

        .form-group input,
        .form-group textarea {
          padding: 0.75rem;
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
          border-radius: 6px;
          font-size: 0.95rem;
          transition: all 0.2s;
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-color, #FFFFFF);
          width: 100%;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          border-color: var(--primary-color, #4da6ff);
          outline: none;
          box-shadow: 0 0 0 3px rgba(77, 166, 255, 0.2);
        }

        .form-group input:hover,
        .form-group textarea:hover {
          border-color: var(--primary-color, #4da6ff);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
          background: var(--apple-card-background, #3A3A3C);
        }

        .primary-button {
          background: var(--primary-color, #4da6ff);
          color: #ffffff;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .primary-button:hover {
          background: var(--primary-color-dark, #2589f2);
          transform: translateY(-2px);
        }

        .secondary-button {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-color, #FFFFFF);
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 500;
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
          cursor: pointer;
          transition: all 0.2s;
        }

        .secondary-button:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .modal-form {
            padding: 1.5rem;
          }

          .form-section {
            padding: 1rem;
          }
        }

        /* Scrollbar styling */
        .add-vendor-modal::-webkit-scrollbar {
          width: 8px;
        }

        .add-vendor-modal::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        .add-vendor-modal::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        .add-vendor-modal::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        `}
      </style>
    </div>
  );
};

export default Vendors; 