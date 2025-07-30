import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { downloadTemplate, parseCSV } from '../../utils/csvUtils';
import EditModal from '../../components/EditModal';
import '../../styles/modules.css';
import { useOrganization } from '../../context/OrganizationContext';
import OrganizationSelector from '../../components/OrganizationSelector';
import { systemsApi } from '../../utils/apiService';

export interface System {
  id: string;
  name: string;
  description: string;
  vendorId: string;
  owner: string;
  storageLocation: string;
  securityMeasures: string;
  contractDetails: string;
  organizational_unit_id?: string;
  organizational_unit_name?: string;
}

interface Vendor {
  id: string;
  name: string;
}

// Initial mock data
const initialSystems: System[] = [
  {
    id: 's001',
    name: 'CRM System',
    description: 'Customer relationship management system',
    vendorId: 'v002',
    owner: 'Sales Department',
    storageLocation: 'Cloud EU',
    securityMeasures: 'Encryption, 2FA, Regular audits',
    contractDetails: 'Enterprise License Agreement, Valid until 2025',
    organizational_unit_id: ''
  },
  {
    id: 's002',
    name: 'HR Management System',
    description: 'Employee data and payroll management',
    vendorId: 'v001',
    owner: 'HR Department',
    storageLocation: 'On-premises',
    securityMeasures: 'Access control, Data encryption',
    contractDetails: 'Annual subscription, Renews Jan 15',
    organizational_unit_id: ''
  },
  {
    id: 's003',
    name: 'Data Warehouse',
    description: 'Business intelligence and analytics platform',
    vendorId: 'v003',
    owner: 'IT Department',
    storageLocation: 'Cloud US',
    securityMeasures: 'Encryption, IAM policies',
    contractDetails: 'Pay-as-you-go model',
    organizational_unit_id: ''
  }
];

const Systems: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const vendorIdParam = queryParams.get('vendorId');

  const [systems, setSystems] = useState<System[]>([]);
  const [filteredSystems, setFilteredSystems] = useState<System[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<System, 'id'>>({
    name: '',
    description: '',
    vendorId: '',
    owner: '',
    storageLocation: '',
    securityMeasures: '',
    contractDetails: '',
    organizational_unit_id: ''
  });
  const [sortConfig, setSortConfig] = useState<{ field: keyof System; direction: 'asc' | 'desc' } | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(vendorIdParam);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSystemId, setCurrentSystemId] = useState('');
  const [editData, setEditData] = useState<System | null>(null);
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

  useEffect(() => {
    // Load organization data
    loadOrganizationData();
    
    // Load systems from API
    const loadSystems = async () => {
      try {
        const loadedSystems = await systemsApi.getAll();
        setSystems(loadedSystems);
      } catch (error) {
        console.error('Failed to load systems:', error);
        // Fallback to initial data if API fails
        setSystems(initialSystems);
      }
    };
    
    loadSystems();

    // Load vendors from localStorage
    const savedVendors = localStorage.getItem('ropa_vendors');
    if (savedVendors) {
      const parsedVendors = JSON.parse(savedVendors);
      setVendors(parsedVendors.map((vendor: any) => ({ id: vendor.id, name: vendor.name })));
    }
  }, [loadOrganizationData]);
  
  // Filter systems based on selected entity, vendor, and search term
  useEffect(() => {
    let filtered = [...systems];
    
    // Apply organization filter if selected
    if (selectedEntityId) {
      filtered = filtered.filter(system => 
        system.organizational_unit_id === selectedEntityId || 
        isChildOfSelectedEntity(system.organizational_unit_id)
      );
    }
    
    // Apply vendor filter if selected
    if (selectedVendorId) {
      filtered = filtered.filter(system => system.vendorId === selectedVendorId);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(system =>
        system.name.toLowerCase().includes(term) ||
        system.description?.toLowerCase().includes(term) ||
        system.owner?.toLowerCase().includes(term)
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
    
    setFilteredSystems(filtered);
  }, [systems, selectedEntityId, selectedVendorId, sortConfig, isChildOfSelectedEntity, searchTerm]);

  // When systems change, save to localStorage
  useEffect(() => {
    localStorage.setItem('ropa_systems', JSON.stringify(systems));
  }, [systems]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleSort = (field: keyof System) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.field === field && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ field, direction });
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get the organizational unit name
    let orgUnitName = '';
    if (formData.organizational_unit_id) {
      orgUnitName = getEntityName(formData.organizational_unit_id);
    }
    
    // Create new system with API
    try {
      const newSystemData = {
        ...formData,
        organizational_unit_name: orgUnitName
      };
      
      const newSystem = await systemsApi.create(newSystemData);
      setSystems(prev => [...prev, newSystem]);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        vendorId: '',
        owner: '',
        storageLocation: '',
        securityMeasures: '',
        contractDetails: '',
        organizational_unit_id: ''
      });
      
      setShowForm(false);
    } catch (error) {
      console.error('Error creating system:', error);
      alert('Failed to create system. Please try again.');
    }
  };

  const handleViewProcessingActivities = (systemId: string) => {
    navigate(`/modules/activities?systemId=${systemId}`);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    
    try {
      // Read file content
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target?.result as string);
        reader.onerror = e => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });
      
      // Parse CSV content
      const parsedSystems = parseCSV(text, 'systems');
      
      // Add these systems to existing systems
      setSystems(prev => [...prev, ...parsedSystems]);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Error parsing CSV file. Please check the format and try again.');
    }
  };

  const handleEditClick = (system: System) => {
    setIsEditing(true);
    setCurrentSystemId(system.id);
    setEditData(system);
  };

  const handleEditSave = async () => {
    if (editData) {
      // Get the organizational unit name
      let orgUnitName = '';
      if (editData.organizational_unit_id) {
        orgUnitName = getEntityName(editData.organizational_unit_id);
      }
      
      try {
        const updatedSystemData = {
          ...editData,
          organizational_unit_name: orgUnitName
        };
        
        await systemsApi.update(currentSystemId, updatedSystemData);
        
        // Update local state
        const updatedSystems = systems.map(system => {
          if (system.id === currentSystemId) {
            return updatedSystemData;
          }
          return system;
        });
        
        setSystems(updatedSystems);
        handleEditCancel();
      } catch (error) {
        console.error('Error updating system:', error);
        alert('Failed to update system. Please try again.');
      }
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setCurrentSystemId('');
    setEditData(null);
  };

  const handleDeleteSystem = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this system?');
    if (confirmed) {
      try {
        await systemsApi.delete(id);
        const updatedSystems = systems.filter(system => system.id !== id);
        setSystems(updatedSystems);
      } catch (error) {
        console.error('Error deleting system:', error);
        alert('Failed to delete system. Please try again.');
      }
    }
  };

  const handleFilterByVendor = (vendorId: string | null) => {
    setSelectedVendorId(vendorId);
    
    // Update URL to reflect filter
    if (vendorId) {
      const newUrl = `${location.pathname}?vendorId=${vendorId}`;
      window.history.pushState({}, '', newUrl);
    } else {
      window.history.pushState({}, '', location.pathname);
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
      <div className="module-header">
        <button className="back-button" onClick={handleBackToDashboard}>
          <span className="back-icon">←</span> Back to Dashboard
        </button>
        <h2>IT Systems Inventory</h2>
        <div className="module-actions">
          <OrganizationSelector />
          <button className="primary-button" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add New System'}
          </button>
        </div>
      </div>
      
      {selectedVendorId && (
        <div className="filter-indicator">
          <p>
            Filtered by vendor: {vendors.find(v => v.id === selectedVendorId)?.name}
            <button 
              className="clear-filter-button" 
              onClick={() => handleFilterByVendor(null)}
            >
              Clear Filter
            </button>
          </p>
        </div>
      )}
      
      {showForm && (
        <div className="form-container">
          <h3>Add New System</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">System Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter system name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="vendorId">Vendor</label>
                <select
                  id="vendorId"
                  name="vendorId"
                  value={formData.vendorId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a vendor</option>
                  {vendors.map(vendor => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter system description"
                rows={3}
              ></textarea>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="owner">System Owner</label>
                <input
                  type="text"
                  id="owner"
                  name="owner"
                  value={formData.owner}
                  onChange={handleInputChange}
                  placeholder="Enter system owner"
                />
              </div>
              <div className="form-group">
                <label htmlFor="storageLocation">Storage Location</label>
                <input
                  type="text"
                  id="storageLocation"
                  name="storageLocation"
                  value={formData.storageLocation}
                  onChange={handleInputChange}
                  placeholder="Enter storage location"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="securityMeasures">Security Measures</label>
              <textarea
                id="securityMeasures"
                name="securityMeasures"
                value={formData.securityMeasures}
                onChange={handleInputChange}
                placeholder="Enter security measures"
                rows={2}
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="contractDetails">Contract Details</label>
              <textarea
                id="contractDetails"
                name="contractDetails"
                value={formData.contractDetails}
                onChange={handleInputChange}
                placeholder="Enter contract details"
                rows={2}
              ></textarea>
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
              <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="primary-button">
                Add System
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="module-tools">
        <div className="import-export-actions">
          <button onClick={() => downloadTemplate('systems')} className="tool-button">
            Download CSV Template
          </button>
          <label className="upload-button">
            Import from CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
          </label>
        </div>
        <div className="search-filter">
          <input
            type="search"
            placeholder="Search systems..."
            defaultValue={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>
                System Name
                {sortConfig?.field === 'name' && (
                  <span className="sort-indicator">
                    {sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('owner')}>
                Owner
                {sortConfig?.field === 'owner' && (
                  <span className="sort-indicator">
                    {sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}
                  </span>
                )}
              </th>
              <th>Vendor</th>
              <th onClick={() => handleSort('organizational_unit_name')}>
                Organizational Unit
                {sortConfig?.field === 'organizational_unit_name' && (
                  <span className="sort-indicator">
                    {sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}
                  </span>
                )}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSystems.length > 0 ? (
              filteredSystems.map(system => (
                <tr key={system.id}>
                  <td>{system.name}</td>
                  <td>{system.owner}</td>
                  <td>
                    <button 
                      className="vendor-link"
                      onClick={() => handleFilterByVendor(system.vendorId)}
                    >
                      {vendors.find(v => v.id === system.vendorId)?.name || 'Unknown Vendor'}
                    </button>
                  </td>
                  <td>{system.organizational_unit_name || 'Not assigned'}</td>
                  <td className="action-cell">
                    <button
                      className="action-button edit"
                      onClick={() => handleEditClick(system)}
                    >
                      Edit
                    </button>
                    <button
                      className="action-button delete"
                      onClick={() => handleDeleteSystem(system.id)}
                    >
                      Delete
                    </button>
                    <button
                      className="action-button view"
                      onClick={() => handleViewProcessingActivities(system.id)}
                    >
                      View Activities
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="empty-table-message">
                  {selectedEntityId ? 
                    `No systems found for ${selectedEntityName}. Add a new system or select a different organizational unit.` : 
                    'No systems found. Add a new system to get started.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {isEditing && editData && (
        <EditModal
          isOpen={true}
          title="Edit System"
          onClose={handleEditCancel}
          onSave={handleEditSave}
        >
          <div className="edit-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="edit-name">System Name</label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={editData.name}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-vendorId">Vendor</label>
                <select
                  id="edit-vendorId"
                  name="vendorId"
                  value={editData.vendorId}
                  onChange={handleEditChange}
                  required
                >
                  <option value="">Select a vendor</option>
                  {vendors.map(vendor => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="edit-description">Description</label>
              <textarea
                id="edit-description"
                name="description"
                value={editData.description}
                onChange={handleEditChange}
                rows={3}
              ></textarea>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="edit-owner">System Owner</label>
                <input
                  type="text"
                  id="edit-owner"
                  name="owner"
                  value={editData.owner}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-storageLocation">Storage Location</label>
                <input
                  type="text"
                  id="edit-storageLocation"
                  name="storageLocation"
                  value={editData.storageLocation}
                  onChange={handleEditChange}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="edit-securityMeasures">Security Measures</label>
              <textarea
                id="edit-securityMeasures"
                name="securityMeasures"
                value={editData.securityMeasures}
                onChange={handleEditChange}
                rows={2}
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="edit-contractDetails">Contract Details</label>
              <textarea
                id="edit-contractDetails"
                name="contractDetails"
                value={editData.contractDetails}
                onChange={handleEditChange}
                rows={2}
              ></textarea>
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
          </div>
        </EditModal>
      )}
    </div>
  );
};

export default Systems; 