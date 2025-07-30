import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  DataBreach, 
  BreachAction, 
  BreachNotification, 
  dataBreachApi 
} from '../../utils/apiService';
import { useOrganization } from '../../context/OrganizationContext';
import '../../styles/modules.css';

const DataBreachDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [breach, setBreach] = useState<DataBreach | null>(null);
  const [actions, setActions] = useState<BreachAction[]>([]);
  const [notifications, setNotifications] = useState<BreachNotification[]>([]);
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Action form state
  const [showActionForm, setShowActionForm] = useState(false);
  const [actionForm, setActionForm] = useState<Omit<BreachAction, 'id' | 'breach_id' | 'created_at'>>({
    action_type: 'containment',
    description: '',
    performed_by: '',
    action_date: new Date().toISOString().split('T')[0],
    status: 'planned'
  });
  
  // Notification form state
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [notificationForm, setNotificationForm] = useState<Omit<BreachNotification, 'id' | 'breach_id' | 'created_at'>>({
    notification_type: 'authority',
    recipient: '',
    notification_date: new Date().toISOString().split('T')[0],
    notification_method: 'email',
    content: '',
    response_received: false
  });
  
  // Organization context for entity names
  const { getEntityName } = useOrganization();
  
  // Fetch data breach details
  useEffect(() => {
    const fetchBreachDetails = async () => {
      if (!id) return;
      
      try {
        const breachData = await dataBreachApi.getBreach(id);
        if (breachData) {
          setBreach(breachData);
        } else {
          console.error('Data breach not found');
          navigate('/modules/data-breach-management');
        }
      } catch (error) {
        console.error('Error fetching data breach details:', error);
      }
    };
    
    fetchBreachDetails();
  }, [id, navigate]);
  
  // Fetch actions when breach is loaded or actions tab is active
  useEffect(() => {
    const fetchActions = async () => {
      if (!id) return;
      
      try {
        const actionsData = await dataBreachApi.getBreachActions(id);
        setActions(actionsData);
      } catch (error) {
        console.error('Error fetching breach actions:', error);
      }
    };
    
    if (breach && activeTab === 'actions') {
      fetchActions();
    }
  }, [id, breach, activeTab]);
  
  // Fetch notifications when breach is loaded or notifications tab is active
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!id) return;
      
      try {
        const notificationsData = await dataBreachApi.getBreachNotifications(id);
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Error fetching breach notifications:', error);
      }
    };
    
    if (breach && activeTab === 'notifications') {
      fetchNotifications();
    }
  }, [id, breach, activeTab]);
  
  const handleActionInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setActionForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNotificationInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setNotificationForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };
  
  const handleSubmitAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      const newAction = await dataBreachApi.createBreachAction(id, actionForm);
      if (newAction) {
        setActions(prev => [...prev, newAction]);
        setShowActionForm(false);
        setActionForm({
          action_type: 'containment',
          description: '',
          performed_by: '',
          action_date: new Date().toISOString().split('T')[0],
          status: 'planned'
        });
      }
    } catch (error) {
      console.error('Error creating breach action:', error);
    }
  };
  
  const handleSubmitNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      const newNotification = await dataBreachApi.createBreachNotification(id, notificationForm);
      if (newNotification) {
        setNotifications(prev => [...prev, newNotification]);
        setShowNotificationForm(false);
        setNotificationForm({
          notification_type: 'authority',
          recipient: '',
          notification_date: new Date().toISOString().split('T')[0],
          notification_method: 'email',
          content: '',
          response_received: false
        });
      }
    } catch (error) {
      console.error('Error creating breach notification:', error);
    }
  };
  
  const updateBreachStatus = async (newStatus: DataBreach['status']) => {
    if (!id || !breach) return;
    
    try {
      const updatedBreach = await dataBreachApi.updateBreach(id, { status: newStatus });
      if (updatedBreach) {
        setBreach(updatedBreach);
      }
    } catch (error) {
      console.error('Error updating breach status:', error);
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'detected': return 'bg-blue-100 text-blue-800';
      case 'assessed': return 'bg-indigo-100 text-indigo-800';
      case 'contained': return 'bg-teal-100 text-teal-800';
      case 'notified': return 'bg-purple-100 text-purple-800';
      case 'recovered': return 'bg-cyan-100 text-cyan-800';
      case 'analyzed': return 'bg-pink-100 text-pink-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (!breach) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <button 
            onClick={() => navigate('/modules/data-breach-management')} 
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center"
          >
            ← Back to Data Breach Management
          </button>
          <h1 className="text-2xl font-bold">{breach.title}</h1>
        </div>
        <div>
          <span 
            className={`px-3 py-1 rounded-full text-xs font-medium mr-2 ${getSeverityBadgeClass(breach.severity)}`}
          >
            {breach.severity.charAt(0).toUpperCase() + breach.severity.slice(1)}
          </span>
          <span 
            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(breach.status)}`}
          >
            {breach.status.charAt(0).toUpperCase() + breach.status.slice(1)}
          </span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b">
          <nav className="flex">
            <button
              className={`px-4 py-3 ${activeTab === 'overview' ? 'bg-blue-50 border-b-2 border-blue-500 font-medium text-blue-600' : 'hover:bg-gray-50'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-4 py-3 ${activeTab === 'actions' ? 'bg-blue-50 border-b-2 border-blue-500 font-medium text-blue-600' : 'hover:bg-gray-50'}`}
              onClick={() => setActiveTab('actions')}
            >
              Actions
            </button>
            <button
              className={`px-4 py-3 ${activeTab === 'notifications' ? 'bg-blue-50 border-b-2 border-blue-500 font-medium text-blue-600' : 'hover:bg-gray-50'}`}
              onClick={() => setActiveTab('notifications')}
            >
              Notifications
            </button>
            <button
              className={`px-4 py-3 ${activeTab === 'analysis' ? 'bg-blue-50 border-b-2 border-blue-500 font-medium text-blue-600' : 'hover:bg-gray-50'}`}
              onClick={() => setActiveTab('analysis')}
            >
              Analysis
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Breach Information</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Breach Date</p>
                      <p>{new Date(breach.breach_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Detection Date</p>
                      <p>{new Date(breach.detection_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Reported By</p>
                      <p>{breach.reported_by}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Breach Type</p>
                      <p>{breach.breach_type.charAt(0).toUpperCase() + breach.breach_type.slice(1)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Organizational Unit</p>
                      <p>{breach.organizational_unit_id ? getEntityName(breach.organizational_unit_id) : 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold mb-4">Affected Information</h2>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Data Subjects</p>
                    <p>{breach.affected_data_subjects || 'Not specified'}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Data Types</p>
                    <p>{breach.affected_data_types || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Systems</p>
                    <p>{breach.affected_systems || 'Not specified'}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="bg-gray-50 p-4 rounded">{breach.description || 'No description provided.'}</p>
              </div>
              
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">Potential Impact</h2>
                <p className="bg-gray-50 p-4 rounded">{breach.potential_impact || 'No impact assessment provided.'}</p>
              </div>
              
              {breach.dpo_assessment && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold mb-2">DPO Assessment</h2>
                  <p className="bg-gray-50 p-4 rounded">{breach.dpo_assessment}</p>
                </div>
              )}
              
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">Notification Requirements</h2>
                <div className="flex space-x-6">
                  <div>
                    <p className="text-sm text-gray-500">Notify Authorities</p>
                    <p>{breach.notify_authorities ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Notify Data Subjects</p>
                    <p>{breach.notify_data_subjects ? 'Yes' : 'No'}</p>
                  </div>
                  {(breach.notify_authorities || breach.notify_data_subjects) && breach.notification_date && (
                    <div>
                      <p className="text-sm text-gray-500">Notification Date</p>
                      <p>{new Date(breach.notification_date).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-8 border-t pt-6">
                <h2 className="text-lg font-semibold mb-4">Workflow Actions</h2>
                <div className="flex flex-wrap gap-2">
                  {breach.status === 'detected' && (
                    <button 
                      onClick={() => updateBreachStatus('assessed')} 
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      Mark as Assessed
                    </button>
                  )}
                  
                  {breach.status === 'assessed' && (
                    <button 
                      onClick={() => updateBreachStatus('contained')} 
                      className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
                    >
                      Mark as Contained
                    </button>
                  )}
                  
                  {breach.status === 'contained' && (
                    <button 
                      onClick={() => updateBreachStatus('notified')} 
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      Mark as Notified
                    </button>
                  )}
                  
                  {breach.status === 'notified' && (
                    <button 
                      onClick={() => updateBreachStatus('recovered')} 
                      className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
                    >
                      Mark as Recovered
                    </button>
                  )}
                  
                  {breach.status === 'recovered' && (
                    <button 
                      onClick={() => updateBreachStatus('analyzed')} 
                      className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
                    >
                      Mark as Analyzed
                    </button>
                  )}
                  
                  {breach.status === 'analyzed' && (
                    <button 
                      onClick={() => updateBreachStatus('closed')} 
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Close Breach
                    </button>
                  )}
                  
                  {breach.status !== 'detected' && breach.status !== 'closed' && (
                    <button 
                      onClick={() => {
                        let prevStatus: DataBreach['status'] = 'detected';
                        
                        if (breach.status === 'assessed') prevStatus = 'detected';
                        else if (breach.status === 'contained') prevStatus = 'assessed';
                        else if (breach.status === 'notified') prevStatus = 'contained';
                        else if (breach.status === 'recovered') prevStatus = 'notified';
                        else if (breach.status === 'analyzed') prevStatus = 'recovered';
                        
                        updateBreachStatus(prevStatus);
                      }} 
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Revert Status
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Breach Actions</h2>
                <button 
                  onClick={() => setShowActionForm(true)} 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Action
                </button>
              </div>
              
              {showActionForm && (
                <div className="bg-gray-50 p-4 rounded mb-6">
                  <h3 className="text-lg font-medium mb-4">New Action</h3>
                  <form onSubmit={handleSubmitAction}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Action Type*</label>
                        <select
                          name="action_type"
                          value={actionForm.action_type}
                          onChange={handleActionInputChange}
                          className="w-full p-2 border rounded"
                          required
                        >
                          <option value="containment">Containment</option>
                          <option value="eradication">Eradication</option>
                          <option value="recovery">Recovery</option>
                          <option value="notification">Notification</option>
                          <option value="analysis">Analysis</option>
                          <option value="prevention">Prevention</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status*</label>
                        <select
                          name="status"
                          value={actionForm.status}
                          onChange={handleActionInputChange}
                          className="w-full p-2 border rounded"
                          required
                        >
                          <option value="planned">Planned</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Performed By*</label>
                        <input
                          type="text"
                          name="performed_by"
                          value={actionForm.performed_by}
                          onChange={handleActionInputChange}
                          className="w-full p-2 border rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Action Date*</label>
                        <input
                          type="date"
                          name="action_date"
                          value={actionForm.action_date}
                          onChange={handleActionInputChange}
                          className="w-full p-2 border rounded"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                        <textarea
                          name="description"
                          value={actionForm.description}
                          onChange={handleActionInputChange}
                          className="w-full p-2 border rounded"
                          rows={3}
                          required
                        ></textarea>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                          name="notes"
                          value={actionForm.notes || ''}
                          onChange={handleActionInputChange}
                          className="w-full p-2 border rounded"
                          rows={2}
                        ></textarea>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowActionForm(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Save Action
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {actions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performed By</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {actions.map(action => (
                        <tr key={action.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {action.action_type.charAt(0).toUpperCase() + action.action_type.slice(1)}
                          </td>
                          <td className="px-6 py-4 text-sm">{action.description}</td>
                          <td className="px-6 py-4 text-sm">{action.performed_by}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {new Date(action.action_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              action.status === 'completed' ? 'bg-green-100 text-green-800' :
                              action.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                              action.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {action.status.charAt(0).toUpperCase() + action.status.slice(1).replace('-', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No actions recorded for this breach. Click "Add Action" to record a new action.
                </div>
              )}
            </div>
          )}
          
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Breach Notifications</h2>
                <button 
                  onClick={() => setShowNotificationForm(true)} 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Notification
                </button>
              </div>
              
              {showNotificationForm && (
                <div className="bg-gray-50 p-4 rounded mb-6">
                  <h3 className="text-lg font-medium mb-4">New Notification</h3>
                  <form onSubmit={handleSubmitNotification}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notification Type*</label>
                        <select
                          name="notification_type"
                          value={notificationForm.notification_type}
                          onChange={handleNotificationInputChange}
                          className="w-full p-2 border rounded"
                          required
                        >
                          <option value="authority">Authority</option>
                          <option value="data_subject">Data Subject</option>
                          <option value="internal">Internal</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notification Method*</label>
                        <select
                          name="notification_method"
                          value={notificationForm.notification_method}
                          onChange={handleNotificationInputChange}
                          className="w-full p-2 border rounded"
                          required
                        >
                          <option value="email">Email</option>
                          <option value="letter">Letter</option>
                          <option value="phone">Phone</option>
                          <option value="in-person">In Person</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Recipient*</label>
                        <input
                          type="text"
                          name="recipient"
                          value={notificationForm.recipient}
                          onChange={handleNotificationInputChange}
                          className="w-full p-2 border rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notification Date*</label>
                        <input
                          type="date"
                          name="notification_date"
                          value={notificationForm.notification_date}
                          onChange={handleNotificationInputChange}
                          className="w-full p-2 border rounded"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                        <textarea
                          name="content"
                          value={notificationForm.content || ''}
                          onChange={handleNotificationInputChange}
                          className="w-full p-2 border rounded"
                          rows={3}
                        ></textarea>
                      </div>
                      <div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="response_received"
                            checked={notificationForm.response_received}
                            onChange={handleNotificationInputChange}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-700">
                            Response Received
                          </label>
                        </div>
                      </div>
                      {notificationForm.response_received && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Response Date</label>
                          <input
                            type="date"
                            name="response_date"
                            value={notificationForm.response_date || ''}
                            onChange={handleNotificationInputChange}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                      )}
                      {notificationForm.response_received && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Response Details</label>
                          <textarea
                            name="response_details"
                            value={notificationForm.response_details || ''}
                            onChange={handleNotificationInputChange}
                            className="w-full p-2 border rounded"
                            rows={2}
                          ></textarea>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowNotificationForm(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Save Notification
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {notifications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {notifications.map(notification => (
                        <tr key={notification.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {notification.notification_type === 'data_subject' ? 'Data Subject' : 
                             notification.notification_type.charAt(0).toUpperCase() + notification.notification_type.slice(1)}
                          </td>
                          <td className="px-6 py-4 text-sm">{notification.recipient}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {notification.notification_method === 'in-person' ? 'In Person' :
                             notification.notification_method.charAt(0).toUpperCase() + notification.notification_method.slice(1)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {new Date(notification.notification_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {notification.response_received ? (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Received
                              </span>
                            ) : (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No notifications recorded for this breach. Click "Add Notification" to record a new notification.
                </div>
              )}
            </div>
          )}
          
          {/* Analysis Tab */}
          {activeTab === 'analysis' && (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold mb-4">Post-Breach Analysis</h2>
              <p className="text-gray-500 mb-6">This feature is coming soon. It will allow you to document the root cause analysis, impact assessment, and lessons learned.</p>
              <button 
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:opacity-50"
                disabled
              >
                Start Analysis (Coming Soon)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataBreachDetail; 