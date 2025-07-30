import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/modules.css';

// Define interfaces for data structures
interface DataSubjectRequest {
  id: string;
  referenceId: string;
  organizationId: string;
  dataSubjectName: string;
  dataSubjectEmail: string;
  requestType: 'access' | 'deletion' | 'rectification' | 'objection' | 'restriction' | 'portability';
  requestDetails: string;
  status: 'new' | 'in-progress' | 'pending-verification' | 'pending-review' | 'completed' | 'denied' | 'expired';
  requestDate: string;
  dueDate: string;
  assignedTo: string;
  resolutionNotes: string;
}

interface RequestComment {
  id: string;
  requestId: string;
  commentText: string;
  commentedBy: string;
  commentDate: string;
}

// Mock data for development purposes
const initialRequests: DataSubjectRequest[] = [
  {
    id: '1',
    referenceId: 'DSR-2023-001',
    organizationId: '1',
    dataSubjectName: 'John Doe',
    dataSubjectEmail: 'john.doe@example.com',
    requestType: 'access',
    requestDetails: 'I would like to access all personal data you hold about me.',
    status: 'new',
    requestDate: '2023-11-01',
    dueDate: '2023-11-30', // Typical 30-day deadline for GDPR
    assignedTo: '',
    resolutionNotes: ''
  },
  {
    id: '2',
    referenceId: 'DSR-2023-002',
    organizationId: '1',
    dataSubjectName: 'Jane Smith',
    dataSubjectEmail: 'jane.smith@example.com',
    requestType: 'deletion',
    requestDetails: 'Please delete all my personal information from your systems.',
    status: 'in-progress',
    requestDate: '2023-11-05',
    dueDate: '2023-12-05',
    assignedTo: 'User1',
    resolutionNotes: 'Verifying identity before proceeding.'
  }
];

const requestTypeOptions = [
  { value: 'access', label: 'Access (Right to Access)' },
  { value: 'deletion', label: 'Deletion (Right to be Forgotten)' },
  { value: 'rectification', label: 'Rectification (Correction)' },
  { value: 'objection', label: 'Objection to Processing' },
  { value: 'restriction', label: 'Restriction of Processing' },
  { value: 'portability', label: 'Data Portability' }
];

const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'pending-verification', label: 'Pending Identity Verification' },
  { value: 'pending-review', label: 'Pending Final Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'denied', label: 'Denied' },
  { value: 'expired', label: 'Expired' }
];

const DataSubjectRequests: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<DataSubjectRequest[]>(initialRequests);
  const [filteredRequests, setFilteredRequests] = useState<DataSubjectRequest[]>(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<DataSubjectRequest | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [comments, setComments] = useState<RequestComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newRequest, setNewRequest] = useState<Partial<DataSubjectRequest>>({
    referenceId: `DSR-${new Date().getFullYear()}-${String(requests.length + 1).padStart(3, '0')}`,
    organizationId: '1', // This would come from the logged-in user's organization
    dataSubjectName: '',
    dataSubjectEmail: '',
    requestType: 'access',
    requestDetails: '',
    status: 'new',
    requestDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    assignedTo: '',
    resolutionNotes: ''
  });

  // Load requests from localStorage on component mount
  useEffect(() => {
    const storedRequests = localStorage.getItem('ropa_dsr_requests');
    if (storedRequests) {
      const parsedRequests = JSON.parse(storedRequests);
      setRequests(parsedRequests);
      setFilteredRequests(parsedRequests);
    }
  }, []);

  // Save requests to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ropa_dsr_requests', JSON.stringify(requests));
  }, [requests]);

  // Apply filters whenever search term or status filter changes
  useEffect(() => {
    let filtered = [...requests];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        req => 
          req.dataSubjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.dataSubjectEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.referenceId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }
    
    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, requests]);

  // Load comments for a request
  useEffect(() => {
    if (selectedRequest) {
      // In a real app, this would be a call to your backend
      // For now, we'll use mock data
      const mockComments: RequestComment[] = [
        {
          id: '1',
          requestId: selectedRequest.id,
          commentText: 'Request received and under initial review.',
          commentedBy: 'System',
          commentDate: selectedRequest.requestDate
        },
        {
          id: '2',
          requestId: selectedRequest.id,
          commentText: 'Sent identity verification email to the data subject.',
          commentedBy: 'User1',
          commentDate: new Date(new Date(selectedRequest.requestDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ];
      
      setComments(mockComments);
    } else {
      setComments([]);
    }
  }, [selectedRequest]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleSelectRequest = (request: DataSubjectRequest) => {
    setSelectedRequest(request);
    setIsAddingNew(false);
  };

  const handleNewRequest = () => {
    setSelectedRequest(null);
    setIsAddingNew(true);
    setNewRequest({
      referenceId: `DSR-${new Date().getFullYear()}-${String(requests.length + 1).padStart(3, '0')}`,
      organizationId: '1',
      dataSubjectName: '',
      dataSubjectEmail: '',
      requestType: 'access',
      requestDetails: '',
      status: 'new',
      requestDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignedTo: '',
      resolutionNotes: ''
    });
  };

  const handleNewRequestChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewRequest(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusClass = (status: string, daysRemaining: number) => {
    if (status === 'completed' || status === 'denied') return 'status-completed';
    if (status === 'expired' || daysRemaining < 0) return 'status-expired';
    if (daysRemaining <= 5) return 'status-urgent';
    if (status === 'new') return 'status-new';
    return 'status-in-progress';
  };

  const handleSaveNewRequest = () => {
    if (!newRequest.dataSubjectName || !newRequest.dataSubjectEmail || !newRequest.requestDetails) {
      alert('Please fill in all required fields.');
      return;
    }

    const newId = String(requests.length + 1);
    const createdRequest = {
      ...newRequest,
      id: newId
    } as DataSubjectRequest;

    setRequests([...requests, createdRequest]);
    setIsAddingNew(false);
    setSelectedRequest(createdRequest);
  };

  const handleUpdateRequestStatus = (newStatus: string) => {
    if (!selectedRequest) return;

    const updatedRequests = requests.map(req => 
      req.id === selectedRequest.id 
        ? { ...req, status: newStatus as DataSubjectRequest['status'] } 
        : req
    );

    setRequests(updatedRequests);
    setSelectedRequest({ ...selectedRequest, status: newStatus as DataSubjectRequest['status'] });

    // Add a comment about the status change
    const newStatusComment: RequestComment = {
      id: String(comments.length + 1),
      requestId: selectedRequest.id,
      commentText: `Status updated to: ${newStatus}`,
      commentedBy: 'Current User', // In a real app, this would be the logged-in user
      commentDate: new Date().toISOString().split('T')[0]
    };

    setComments([...comments, newStatusComment]);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedRequest) return;

    const newCommentObj: RequestComment = {
      id: String(comments.length + 1),
      requestId: selectedRequest.id,
      commentText: newComment,
      commentedBy: 'Current User', // In a real app, this would be the logged-in user
      commentDate: new Date().toISOString().split('T')[0]
    };

    setComments([...comments, newCommentObj]);
    setNewComment('');
  };

  return (
    <div className="dsr-container">
      <div className="module-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h2>Data Subject Requests</h2>
        <button className="primary-button" onClick={handleNewRequest}>
          + New Request
        </button>
      </div>

      <div className="dsr-content">
        <div className="dsr-sidebar">
          <div className="search-filters">
            <input
              type="text"
              placeholder="Search by name, email, or reference..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            <select 
              value={statusFilter} 
              onChange={handleStatusFilterChange}
              className="status-filter"
            >
              <option value="all">All Statuses</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="request-list">
            {filteredRequests.length === 0 ? (
              <div className="no-requests">No requests match your filters.</div>
            ) : (
              filteredRequests.map(request => {
                const daysRemaining = calculateDaysRemaining(request.dueDate);
                const statusClass = getStatusClass(request.status, daysRemaining);
                
                return (
                  <div 
                    key={request.id} 
                    className={`request-item ${selectedRequest?.id === request.id ? 'selected' : ''}`}
                    onClick={() => handleSelectRequest(request)}
                  >
                    <div className="request-item-header">
                      <span className="reference-id">{request.referenceId}</span>
                      <span className={`request-status ${statusClass}`}>
                        {statusOptions.find(opt => opt.value === request.status)?.label}
                      </span>
                    </div>
                    <div className="request-item-body">
                      <div className="subject-info">
                        <strong>{request.dataSubjectName}</strong>
                        <span>{request.dataSubjectEmail}</span>
                      </div>
                      <div className="request-type-date">
                        <span className="request-type">
                          {requestTypeOptions.find(opt => opt.value === request.requestType)?.label}
                        </span>
                        <span className="request-date">
                          Received: {new Date(request.requestDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="request-item-footer">
                      <span className={`days-remaining ${daysRemaining <= 5 ? 'urgent' : ''}`}>
                        {daysRemaining > 0 
                          ? `${daysRemaining} days remaining` 
                          : daysRemaining === 0 
                            ? 'Due today!' 
                            : `Overdue by ${Math.abs(daysRemaining)} days`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="dsr-main">
          {isAddingNew ? (
            <div className="new-request-form">
              <h3>New Data Subject Request</h3>
              
              <div className="form-group">
                <label>Reference ID</label>
                <input 
                  type="text" 
                  name="referenceId" 
                  value={newRequest.referenceId} 
                  readOnly 
                  className="form-input"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Data Subject Name*</label>
                  <input 
                    type="text" 
                    name="dataSubjectName" 
                    value={newRequest.dataSubjectName} 
                    onChange={handleNewRequestChange} 
                    required 
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Data Subject Email*</label>
                  <input 
                    type="email" 
                    name="dataSubjectEmail" 
                    value={newRequest.dataSubjectEmail} 
                    onChange={handleNewRequestChange} 
                    required 
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Request Type*</label>
                <select 
                  name="requestType" 
                  value={newRequest.requestType} 
                  onChange={handleNewRequestChange} 
                  required 
                  className="form-select"
                >
                  {requestTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Request Details*</label>
                <textarea 
                  name="requestDetails" 
                  value={newRequest.requestDetails} 
                  onChange={handleNewRequestChange} 
                  required 
                  className="form-textarea"
                  rows={4}
                ></textarea>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Request Date</label>
                  <input 
                    type="date" 
                    name="requestDate" 
                    value={newRequest.requestDate} 
                    onChange={handleNewRequestChange} 
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Due Date</label>
                  <input 
                    type="date" 
                    name="dueDate" 
                    value={newRequest.dueDate} 
                    onChange={handleNewRequestChange} 
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setIsAddingNew(false)} 
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleSaveNewRequest} 
                  className="save-button"
                >
                  Save Request
                </button>
              </div>
            </div>
          ) : selectedRequest ? (
            <div className="request-details">
              <div className="request-header">
                <h3>{selectedRequest.referenceId}</h3>
                <div className="request-status-actions">
                  <select 
                    value={selectedRequest.status} 
                    onChange={(e) => handleUpdateRequestStatus(e.target.value)}
                    className="status-select"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <div className="request-actions">
                    <button className="action-button">Export</button>
                    <button className="action-button">Archive</button>
                  </div>
                </div>
              </div>
              
              <div className="request-info-card">
                <div className="request-info-section">
                  <h4>Request Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Request Type:</span>
                      <span className="info-value">
                        {requestTypeOptions.find(opt => opt.value === selectedRequest.requestType)?.label}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Request Date:</span>
                      <span className="info-value">
                        {new Date(selectedRequest.requestDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Due Date:</span>
                      <span className="info-value">
                        {new Date(selectedRequest.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Time Remaining:</span>
                      <span className="info-value">
                        {calculateDaysRemaining(selectedRequest.dueDate)} days
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="request-info-section">
                  <h4>Data Subject Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Name:</span>
                      <span className="info-value">{selectedRequest.dataSubjectName}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{selectedRequest.dataSubjectEmail}</span>
                    </div>
                  </div>
                </div>
                
                <div className="request-info-section">
                  <h4>Request Details</h4>
                  <p className="request-details-text">{selectedRequest.requestDetails}</p>
                </div>
                
                {selectedRequest.assignedTo && (
                  <div className="request-info-section">
                    <h4>Assigned To</h4>
                    <p>{selectedRequest.assignedTo}</p>
                  </div>
                )}
                
                {selectedRequest.resolutionNotes && (
                  <div className="request-info-section">
                    <h4>Resolution Notes</h4>
                    <p>{selectedRequest.resolutionNotes}</p>
                  </div>
                )}
              </div>
              
              <div className="request-activity">
                <h4>Activity Log</h4>
                <div className="activity-timeline">
                  {comments.map(comment => (
                    <div key={comment.id} className="activity-item">
                      <div className="activity-meta">
                        <span className="activity-user">{comment.commentedBy}</span>
                        <span className="activity-date">
                          {new Date(comment.commentDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="activity-content">
                        {comment.commentText}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="add-comment">
                  <textarea 
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment or update..."
                    className="comment-input"
                  ></textarea>
                  <button onClick={handleAddComment} className="add-comment-button">
                    Add Comment
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-request-selected">
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No Request Selected</h3>
                <p>Select a request from the list to view details or create a new request.</p>
                <button className="primary-button" onClick={handleNewRequest}>
                  + Create New Request
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataSubjectRequests; 