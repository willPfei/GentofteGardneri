import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataBreach, dataBreachApi } from '../../utils/apiService';
import { useOrganization } from '../../context/OrganizationContext';
import OrganizationSelector from '../../components/OrganizationSelector';
import '../../styles/modules.css';

const DataBreachManagement: React.FC = () => {
  const navigate = useNavigate();
  const [dataBreaches, setDataBreaches] = useState<DataBreach[]>([]);
  const [filteredBreaches, setFilteredBreaches] = useState<DataBreach[]>([]);
  const [selectedBreach, setSelectedBreach] = useState<DataBreach | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ field: keyof DataBreach; direction: 'asc' | 'desc' }>({
    field: 'detection_date',
    direction: 'desc'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState<Omit<DataBreach, 'id' | 'created_at' | 'updated_at'>>({
    title: '',
    description: '',
    breach_date: new Date().toISOString().split('T')[0],
    detection_date: new Date().toISOString().split('T')[0],
    reported_by: '',
    affected_data_subjects: '',
    affected_data_types: '',
    affected_systems: '',
    severity: 'medium',
    breach_type: 'confidentiality',
    status: 'detected',
    potential_impact: '',
    dpo_assessment: '',
    notify_authorities: false,
    notify_data_subjects: false,
    organizational_unit_id: ''
  });

  // Organization context
  const {
    selectedEntityId,
    organizationalUnits,
    loadOrganizationData
  } = useOrganization();

  // Load data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        // First load organization data
        await loadOrganizationData();
        // Then fetch data breaches
        await fetchDataBreaches();
      } catch (error) {
        console.error('Error initializing data:', error);
        setError('Failed to initialize application data. Please refresh the page.');
        setIsLoading(false);
      }
    };
    
    console.log('DataBreachManagement component mounted, initializing data...');
    initializeData();
    
    // Don't include fetchDataBreaches in dependencies to avoid loop
  }, []);  // Empty dependency array to only run on mount

  // Filter breaches based on search, status, severity, and organization
  useEffect(() => {
    if (!dataBreaches.length) return;
    
    try {
      let filtered = [...dataBreaches];

      // Apply organization filter
      if (selectedEntityId) {
        filtered = filtered.filter(breach =>
          breach.organizational_unit_id === selectedEntityId
        );
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        filtered = filtered.filter(breach => breach.status === statusFilter);
      }

      // Apply severity filter
      if (severityFilter !== 'all') {
        filtered = filtered.filter(breach => breach.severity === severityFilter);
      }

      // Apply search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(breach =>
          breach.title.toLowerCase().includes(term) ||
          (breach.description && breach.description.toLowerCase().includes(term)) ||
          (breach.affected_data_subjects && breach.affected_data_subjects.toLowerCase().includes(term))
        );
      }

      // Apply sorting
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.field]?.toString() || '';
        const bValue = b[sortConfig.field]?.toString() || '';

        if (sortConfig.direction === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });

      setFilteredBreaches(filtered);
    } catch (err) {
      console.error("Error filtering breaches:", err);
      setError("Error filtering data. Please refresh the page and try again.");
    }
  }, [dataBreaches, searchTerm, statusFilter, severityFilter, selectedEntityId, sortConfig]);

  // Simple utility function to check if a breach belongs to selected org
  const belongsToSelectedOrg = (breach: DataBreach): boolean => {
    return !selectedEntityId || breach.organizational_unit_id === selectedEntityId;
  };

  const fetchDataBreaches = async () => {
    console.log("Starting to fetch data breaches...");
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Making API call to fetch data breaches...");
      const breaches = await dataBreachApi.getAllBreaches();
      console.log("API response received:", breaches);
      
      // Check if breaches is defined and is an array
      if (breaches && Array.isArray(breaches)) {
        // If array is empty, create some demo data
        if (breaches.length === 0) {
          console.log("No data breaches found, creating demo data");
          const demoBreaches = [
            {
              id: 'db123456',
              title: 'Demo Data Breach',
              description: 'This is a demo data breach for testing purposes.',
              breach_date: '2023-01-15',
              detection_date: '2023-01-20',
              reported_by: 'System Admin',
              affected_data_subjects: 'Customers',
              affected_data_types: 'Email addresses, Names',
              affected_systems: 'CRM System',
              severity: 'high' as const,
              breach_type: 'confidentiality' as const,
              status: 'assessed' as const,
              potential_impact: 'Potential identity theft risk',
              dpo_assessment: 'Medium risk, notification required',
              notify_authorities: true,
              notify_data_subjects: false,
              organizational_unit_id: '',
              created_at: '2023-01-20T10:30:00Z',
              updated_at: '2023-01-20T10:30:00Z'
            },
            {
              id: 'db789012',
              title: 'Test Security Incident',
              description: 'A test security incident for demonstration.',
              breach_date: '2023-02-10',
              detection_date: '2023-02-12',
              reported_by: 'Security Team',
              affected_data_subjects: 'Employees',
              affected_data_types: 'Internal documents',
              affected_systems: 'Document Management',
              severity: 'medium' as const,
              breach_type: 'integrity' as const,
              status: 'contained' as const,
              potential_impact: 'Minimal impact on operations',
              dpo_assessment: 'Low risk, no notification needed',
              notify_authorities: false,
              notify_data_subjects: false,
              organizational_unit_id: '',
              created_at: '2023-02-12T14:15:00Z',
              updated_at: '2023-02-15T09:45:00Z'
            }
          ];
          setDataBreaches(demoBreaches);
          setFilteredBreaches(demoBreaches);
          console.log("Demo data set successfully");
        } else {
          console.log(`Setting ${breaches.length} data breaches from API`);
          setDataBreaches(breaches);
          setFilteredBreaches(breaches);
        }
      } else {
        console.error("Received invalid data format:", breaches);
        setError('Data format error: Expected an array of data breaches');
        // Use demo data as fallback
        const fallbackData = [
          {
            id: 'db-fallback',
            title: 'Fallback Data Breach',
            description: 'This is a fallback data breach when API returns invalid format.',
            breach_date: '2023-01-01',
            detection_date: '2023-01-02',
            reported_by: 'System',
            affected_data_subjects: 'Unknown',
            affected_data_types: 'Unknown',
            affected_systems: 'Unknown',
            severity: 'medium' as const,
            breach_type: 'confidentiality' as const,
            status: 'detected' as const,
            potential_impact: 'Unknown',
            dpo_assessment: '',
            notify_authorities: false,
            notify_data_subjects: false,
            organizational_unit_id: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setDataBreaches(fallbackData);
        setFilteredBreaches(fallbackData);
      }
    } catch (error) {
      console.error('Error fetching data breaches:', error);
      setError('Failed to load data breach records. Using demo data instead.');
      
      // Always provide demo data even on error
      const errorFallbackData = [
        {
          id: 'db-error',
          title: 'Error Fallback Data Breach',
          description: 'This is a fallback data breach shown when the API fails.',
          breach_date: '2023-01-01',
          detection_date: '2023-01-02',
          reported_by: 'System',
          affected_data_subjects: 'Unknown',
          affected_data_types: 'Unknown',
          affected_systems: 'Unknown',
          severity: 'medium' as const,
          breach_type: 'confidentiality' as const,
          status: 'detected' as const,
          potential_impact: 'Unknown',
          dpo_assessment: '',
          notify_authorities: false,
          notify_data_subjects: false,
          organizational_unit_id: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setDataBreaches(errorFallbackData);
      setFilteredBreaches(errorFallbackData);
    } finally {
      console.log("Fetch operation completed, setting isLoading to false");
      setIsLoading(false);
    }
  };

  const handleSort = (field: keyof DataBreach) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleAddBreach = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      const newBreach = await dataBreachApi.createBreach(formData);
      if (newBreach) {
        setDataBreaches(prev => [...prev, newBreach]);
        setShowAddModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error adding data breach:', error);
      alert('Failed to add data breach. Please try again.');
    }
  };

  const handleUpdateBreach = async () => {
    if (selectedBreach) {
      try {
        const updatedBreach = await dataBreachApi.updateBreach(selectedBreach.id, formData);
        if (updatedBreach) {
          setDataBreaches(prev =>
            prev.map(breach => (breach.id === selectedBreach.id ? updatedBreach : breach))
          );
          setShowEditModal(false);
          setSelectedBreach(null);
        }
      } catch (error) {
        console.error('Error updating data breach:', error);
        alert('Failed to update data breach. Please try again.');
      }
    }
  };

  const handleDeleteBreach = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this data breach?')) {
      try {
        const success = await dataBreachApi.deleteBreach(id);
        if (success) {
          setDataBreaches(prev => prev.filter(breach => breach.id !== id));
        }
      } catch (error) {
        console.error('Error deleting data breach:', error);
        alert('Failed to delete data breach. Please try again.');
      }
    }
  };

  const handleEditBreach = (breach: DataBreach) => {
    setSelectedBreach(breach);
    setFormData({
      title: breach.title,
      description: breach.description || '',
      breach_date: breach.breach_date,
      detection_date: breach.detection_date,
      reported_by: breach.reported_by,
      affected_data_subjects: breach.affected_data_subjects || '',
      affected_data_types: breach.affected_data_types || '',
      affected_systems: breach.affected_systems || '',
      severity: breach.severity,
      breach_type: breach.breach_type,
      status: breach.status,
      potential_impact: breach.potential_impact || '',
      dpo_assessment: breach.dpo_assessment || '',
      notify_authorities: breach.notify_authorities,
      notify_data_subjects: breach.notify_data_subjects,
      notification_date: breach.notification_date || '',
      organizational_unit_id: breach.organizational_unit_id || '',
      closed_at: breach.closed_at
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      breach_date: new Date().toISOString().split('T')[0],
      detection_date: new Date().toISOString().split('T')[0],
      reported_by: '',
      affected_data_subjects: '',
      affected_data_types: '',
      affected_systems: '',
      severity: 'medium',
      breach_type: 'confidentiality',
      status: 'detected',
      potential_impact: '',
      dpo_assessment: '',
      notify_authorities: false,
      notify_data_subjects: false,
      organizational_unit_id: ''
    });
  };

  const handleDetailedView = (id: string) => {
    navigate(`/modules/data-breach-detail/${id}`);
  };

  const getSeverityClass = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'detected':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'assessed':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'contained':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      case 'notified':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'recovered':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'analyzed':
        return 'bg-cyan-100 text-cyan-800 border border-cyan-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4">
          <div className="px-4 py-4 sm:px-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-medium text-gray-900">Data Breach Management</h1>
                <p className="mt-1 text-sm text-gray-600">Monitor and manage data breach incidents</p>
              </div>
              <div className="flex space-x-2">
                <button
                  className="bg-gray-100 text-gray-600 py-2 px-3 rounded text-sm font-medium flex items-center"
                  onClick={() => navigate('/dashboard')}
                >
                  Back to Dashboard
                </button>
                <button
                  className="bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium flex items-center"
                  onClick={() => setShowAddModal(true)}
                >
                  Report Breach
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900">Loading data breaches</h3>
          <p className="mt-1 text-sm text-gray-500">Please wait while we retrieve your data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4">
          <div className="px-4 py-4 sm:px-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-medium text-gray-900">Data Breach Management</h1>
                <p className="mt-1 text-sm text-gray-600">Monitor and manage data breach incidents</p>
              </div>
              <div className="flex space-x-2">
                <button
                  className="bg-gray-100 text-gray-600 py-2 px-3 rounded text-sm font-medium flex items-center"
                  onClick={() => navigate('/dashboard')}
                >
                  Back to Dashboard
                </button>
                <button
                  className="bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium flex items-center"
                  onClick={() => setShowAddModal(true)}
                >
                  Report Breach
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-md bg-red-50 p-4 mt-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading data breaches</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={fetchDataBreaches}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 min-h-[44px]"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-medium text-gray-900">Data Breach Management</h1>
              <p className="mt-1 text-sm text-gray-600">Monitor and manage data breach incidents</p>
            </div>
            <div className="flex space-x-2">
              <button
                className="bg-gray-100 text-gray-600 py-2 px-3 rounded text-sm font-medium flex items-center"
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </button>
              <button
                className="bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium flex items-center"
                onClick={() => setShowAddModal(true)}
              >
                Report Breach
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Debug section - only visible during development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 border border-yellow-400 bg-yellow-50 rounded-lg text-xs">
          <h3 className="font-bold text-yellow-800 mb-1">Debug Information</h3>
          <div className="grid grid-cols-2 gap-1">
            <div><strong>isLoading:</strong> {isLoading ? 'true' : 'false'}</div>
            <div><strong>error:</strong> {error || 'none'}</div>
            <div><strong>dataBreaches:</strong> {dataBreaches.length}</div>
            <div><strong>filteredBreaches:</strong> {filteredBreaches.length}</div>
            <div><strong>selectedEntityId:</strong> {selectedEntityId || 'none'}</div>
            <div><strong>searchTerm:</strong> {searchTerm || 'none'}</div>
          </div>
          <div className="mt-1">
            <button 
              className="bg-yellow-600 text-white py-1 px-2 rounded text-xs"
              onClick={() => fetchDataBreaches()}
            >
              Refresh Data
            </button>
          </div>
        </div>
      )}

      <div className="mb-4">
        <OrganizationSelector />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-700">Filters</h2>
        </div>
        <div className="p-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label htmlFor="search-breaches" className="block mb-1 text-xs font-medium text-gray-700">Search</label>
            <input
              id="search-breaches"
              type="text"
              placeholder="Search breaches..."
              className="w-full py-1.5 px-3 text-sm border border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="status-filter" className="block mb-1 text-xs font-medium text-gray-700">Status</label>
            <select
              id="status-filter"
              className="w-full py-1.5 px-3 text-sm border border-gray-300 rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="detected">Detected</option>
              <option value="assessed">Assessed</option>
              <option value="contained">Contained</option>
              <option value="notified">Notified</option>
              <option value="recovered">Recovered</option>
              <option value="analyzed">Analyzed</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="severity-filter" className="block mb-1 text-xs font-medium text-gray-700">Severity</label>
            <select
              id="severity-filter"
              className="w-full py-1.5 px-3 text-sm border border-gray-300 rounded-md"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 text-center">
          <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-sm text-gray-600">Loading data breaches...</p>
        </div>
      ) : error ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <div className="rounded-md bg-red-50 p-3">
            <div className="flex">
              <div className="text-sm text-red-700">
                <p className="font-medium mb-1">Error loading data breaches</p>
                <p>{error}</p>
                <button
                  type="button"
                  onClick={fetchDataBreaches}
                  className="mt-2 py-1 px-2 bg-red-100 text-red-700 text-xs rounded-md"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-sm font-medium text-gray-700">
              Data Breach Records <span className="text-gray-500 font-normal">({filteredBreaches.length})</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" 
                      className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" 
                      onClick={() => handleSort('title')}>
                    Title {sortConfig.field === 'title' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th scope="col" 
                      className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" 
                      onClick={() => handleSort('breach_date')}>
                    Breach Date {sortConfig.field === 'breach_date' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th scope="col" 
                      className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" 
                      onClick={() => handleSort('severity')}>
                    Severity {sortConfig.field === 'severity' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th scope="col" 
                      className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" 
                      onClick={() => handleSort('status')}>
                    Status {sortConfig.field === 'status' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th scope="col" className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBreaches.length > 0 ? (
                  filteredBreaches.map((breach) => (
                    <tr key={breach.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{breach.title}</div>
                      </td>
                      <td className="py-2 px-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(breach.breach_date).toLocaleDateString()}</div>
                      </td>
                      <td className="py-2 px-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${getSeverityClass(breach.severity)}`}>
                          {breach.severity.charAt(0).toUpperCase() + breach.severity.slice(1)}
                        </span>
                      </td>
                      <td className="py-2 px-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${getStatusClass(breach.status)}`}>
                          {breach.status.charAt(0).toUpperCase() + breach.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-right whitespace-nowrap text-xs">
                        <div className="flex justify-end space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => handleDetailedView(breach.id)}
                          >
                            View
                          </button>
                          <button
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={() => handleEditBreach(breach)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteBreach(breach.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      <div className="text-gray-500 text-sm">
                        <p className="mb-1">No data breaches found</p>
                        <p className="text-gray-400 text-xs">Try adjusting your filters or report a new breach</p>
                        <button
                          className="mt-3 px-3 py-1 bg-blue-600 text-white text-xs rounded"
                          onClick={() => setShowAddModal(true)}
                        >
                          Report Data Breach
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Data Breach Modal - Simplified version */}
      {showAddModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-gray-500 opacity-50" onClick={() => setShowAddModal(false)}></div>
            
            <div className="relative bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto m-4 p-4">
              <div className="absolute top-2 right-2">
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => setShowAddModal(false)}
                >
                  ✕
                </button>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Report a Data Breach</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Fields marked with * are required.
                </p>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleAddBreach();
                }} className="space-y-4">
                  <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="breach-title" className="block text-sm font-medium text-gray-700">
                        Title *
                      </label>
                      <input
                        type="text"
                        id="breach-title"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="breach-description" className="block text-sm font-medium text-gray-700">
                        Description *
                      </label>
                      <textarea
                        id="breach-description"
                        name="description"
                        required
                        rows={3}
                        value={formData.description || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="breach-date" className="block text-sm font-medium text-gray-700">
                        Breach Date *
                      </label>
                      <input
                        type="date"
                        id="breach-date"
                        name="breach_date"
                        required
                        value={formData.breach_date}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="detection-date" className="block text-sm font-medium text-gray-700">
                        Detection Date *
                      </label>
                      <input
                        type="date"
                        id="detection-date"
                        name="detection_date"
                        required
                        value={formData.detection_date}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="reported-by" className="block text-sm font-medium text-gray-700">
                        Reported By *
                      </label>
                      <input
                        type="text"
                        id="reported-by"
                        name="reported_by"
                        required
                        value={formData.reported_by}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="org-unit" className="block text-sm font-medium text-gray-700">
                        Organizational Unit *
                      </label>
                      <select
                        id="org-unit"
                        name="organizational_unit_id"
                        required
                        value={formData.organizational_unit_id}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm"
                      >
                        <option value="">Select an organization</option>
                        {organizationalUnits.map(unit => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
                        Severity *
                      </label>
                      <select
                        id="severity"
                        name="severity"
                        required
                        value={formData.severity}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="breach-type" className="block text-sm font-medium text-gray-700">
                        Breach Type *
                      </label>
                      <select
                        id="breach-type"
                        name="breach_type"
                        required
                        value={formData.breach_type}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm"
                      >
                        <option value="confidentiality">Confidentiality</option>
                        <option value="integrity">Integrity</option>
                        <option value="availability">Availability</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="mr-2 py-1.5 px-3 border border-gray-300 rounded-md text-sm text-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="py-1.5 px-3 bg-blue-600 text-white rounded-md text-sm"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - Also simplify the edit modal similar to the add modal */}
      {showEditModal && selectedBreach && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-gray-500 opacity-50" onClick={() => {
              setShowEditModal(false);
              setSelectedBreach(null);
            }}></div>
            
            <div className="relative bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto m-4 p-4">
              <div className="absolute top-2 right-2">
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedBreach(null);
                  }}
                >
                  ✕
                </button>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Edit Data Breach</h3>
                
                <form className="space-y-4">
                  <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">
                        Title *
                      </label>
                      <input
                        type="text"
                        id="edit-title"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700">
                        Status *
                      </label>
                      <select
                        id="edit-status"
                        name="status"
                        required
                        value={formData.status}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm"
                      >
                        <option value="detected">Detected</option>
                        <option value="assessed">Assessed</option>
                        <option value="contained">Contained</option>
                        <option value="notified">Notified</option>
                        <option value="recovered">Recovered</option>
                        <option value="analyzed">Analyzed</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="edit-severity" className="block text-sm font-medium text-gray-700">
                        Severity *
                      </label>
                      <select
                        id="edit-severity"
                        name="severity"
                        required
                        value={formData.severity}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="edit-breach-type" className="block text-sm font-medium text-gray-700">
                        Breach Type *
                      </label>
                      <select
                        id="edit-breach-type"
                        name="breach_type"
                        required
                        value={formData.breach_type}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm"
                      >
                        <option value="confidentiality">Confidentiality</option>
                        <option value="integrity">Integrity</option>
                        <option value="availability">Availability</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="edit-description"
                        name="description"
                        rows={3}
                        value={formData.description || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="edit-notify-authorities"
                        name="notify_authorities"
                        checked={formData.notify_authorities}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label htmlFor="edit-notify-authorities" className="ml-2 text-sm text-gray-700">
                        Notify Authorities
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="edit-notify-subjects"
                        name="notify_data_subjects"
                        checked={formData.notify_data_subjects}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label htmlFor="edit-notify-subjects" className="ml-2 text-sm text-gray-700">
                        Notify Data Subjects
                      </label>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditModal(false);
                          setSelectedBreach(null);
                        }}
                        className="mr-2 py-1.5 px-3 border border-gray-300 rounded-md text-sm text-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleUpdateBreach}
                        className="py-1.5 px-3 bg-blue-600 text-white rounded-md text-sm"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataBreachManagement; 