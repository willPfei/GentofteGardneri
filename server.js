const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = process.env.PORT || 3001;
const cors = require('cors');
const { createDataBreachTables } = require('./server/schema/dataBreachSchema');

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// Connect to SQLite database
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database ' + err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Initialize Data Breach tables
db.exec(createDataBreachTables, (err) => {
  if (err) {
    console.error('Error creating data breach tables:', err.message);
  } else {
    console.log('Data breach tables initialized successfully');
  }
});

// API endpoint to get all users
app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: rows
    });
  });
});

// API endpoint to create a new user
app.post('/api/users', (req, res) => {
  const { name, email, role, organizationId } = req.body;
  const sql = 'INSERT INTO users (name, email, role, organizationId) VALUES (?, ?, ?, ?)';
  const params = [name, email, role, organizationId];
  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: { id: this.lastID, name, email, role, organizationId }
    });
  });
});

// API endpoint to update a user
app.put('/api/users/:id', (req, res) => {
  const { name, email, role } = req.body;
  const { id } = req.params;
  const sql = 'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?';
  const params = [name, email, role, id];
  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: { id, name, email, role }
    });
  });
});

// API endpoint to delete a user
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM users WHERE id = ?';
  db.run(sql, id, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'deleted',
      data: { id }
    });
  });
});

// API endpoints for Data Subject Requests

// Get all data subject requests for an organization
app.get('/api/dsr', (req, res) => {
  const organizationId = req.query.organizationId || '1'; // Default to org 1 for now
  const sql = 'SELECT * FROM data_subject_requests WHERE organization_id = ? ORDER BY request_date DESC';
  
  db.all(sql, [organizationId], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    
    // Convert snake_case to camelCase for frontend
    const requests = rows.map(row => ({
      id: row.id.toString(),
      referenceId: row.reference_id,
      organizationId: row.organization_id,
      dataSubjectName: row.data_subject_name,
      dataSubjectEmail: row.data_subject_email,
      requestType: row.request_type,
      requestDetails: row.request_details,
      status: row.status,
      requestDate: row.request_date,
      dueDate: row.due_date,
      assignedTo: row.assigned_to,
      resolutionNotes: row.resolution_notes
    }));
    
    res.json({
      message: 'success',
      data: requests
    });
  });
});

// Get a single data subject request by ID
app.get('/api/dsr/:id', (req, res) => {
  const sql = 'SELECT * FROM data_subject_requests WHERE id = ?';
  
  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }
    
    // Convert snake_case to camelCase
    const request = {
      id: row.id.toString(),
      referenceId: row.reference_id,
      organizationId: row.organization_id,
      dataSubjectName: row.data_subject_name,
      dataSubjectEmail: row.data_subject_email,
      requestType: row.request_type,
      requestDetails: row.request_details,
      status: row.status,
      requestDate: row.request_date,
      dueDate: row.due_date,
      assignedTo: row.assigned_to,
      resolutionNotes: row.resolution_notes
    };
    
    res.json({
      message: 'success',
      data: request
    });
  });
});

// Create a new data subject request
app.post('/api/dsr', (req, res) => {
  const {
    referenceId,
    organizationId,
    dataSubjectName,
    dataSubjectEmail,
    requestType,
    requestDetails,
    requestDate,
    dueDate,
    status = 'new',
    assignedTo = '',
    resolutionNotes = ''
  } = req.body;
  
  if (!dataSubjectName || !dataSubjectEmail || !requestType || !requestDetails) {
    res.status(400).json({ error: 'Required fields missing' });
    return;
  }
  
  const sql = `
    INSERT INTO data_subject_requests (
      reference_id, organization_id, data_subject_name, data_subject_email, 
      request_type, request_details, status, request_date, due_date, 
      assigned_to, resolution_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    referenceId,
    organizationId,
    dataSubjectName,
    dataSubjectEmail,
    requestType,
    requestDetails,
    status,
    requestDate,
    dueDate,
    assignedTo,
    resolutionNotes
  ];
  
  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    
    res.json({
      message: 'success',
      data: {
        id: this.lastID.toString(),
        referenceId,
        organizationId,
        dataSubjectName,
        dataSubjectEmail,
        requestType,
        requestDetails,
        status,
        requestDate,
        dueDate,
        assignedTo,
        resolutionNotes
      }
    });
  });
});

// Update a data subject request
app.put('/api/dsr/:id', (req, res) => {
  const {
    referenceId,
    dataSubjectName,
    dataSubjectEmail,
    requestType,
    requestDetails,
    status,
    dueDate,
    assignedTo,
    resolutionNotes
  } = req.body;
  
  const sql = `
    UPDATE data_subject_requests SET
      reference_id = COALESCE(?, reference_id),
      data_subject_name = COALESCE(?, data_subject_name),
      data_subject_email = COALESCE(?, data_subject_email),
      request_type = COALESCE(?, request_type),
      request_details = COALESCE(?, request_details),
      status = COALESCE(?, status),
      due_date = COALESCE(?, due_date),
      assigned_to = COALESCE(?, assigned_to),
      resolution_notes = COALESCE(?, resolution_notes),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  const params = [
    referenceId,
    dataSubjectName,
    dataSubjectEmail,
    requestType,
    requestDetails,
    status,
    dueDate,
    assignedTo,
    resolutionNotes,
    req.params.id
  ];
  
  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }
    
    // Fetch the updated record to return
    db.get('SELECT * FROM data_subject_requests WHERE id = ?', [req.params.id], (err, row) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      
      const updatedRequest = {
        id: row.id.toString(),
        referenceId: row.reference_id,
        organizationId: row.organization_id,
        dataSubjectName: row.data_subject_name,
        dataSubjectEmail: row.data_subject_email,
        requestType: row.request_type,
        requestDetails: row.request_details,
        status: row.status,
        requestDate: row.request_date,
        dueDate: row.due_date,
        assignedTo: row.assigned_to,
        resolutionNotes: row.resolution_notes
      };
      
      res.json({
        message: 'success',
        data: updatedRequest
      });
    });
  });
});

// Delete a data subject request
app.delete('/api/dsr/:id', (req, res) => {
  db.run('DELETE FROM data_subject_requests WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }
    
    res.json({ message: 'deleted', changes: this.changes });
  });
});

// Get comments for a data subject request
app.get('/api/dsr/:requestId/comments', (req, res) => {
  const sql = 'SELECT * FROM dsr_comments WHERE request_id = ? ORDER BY comment_date ASC';
  
  db.all(sql, [req.params.requestId], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    
    // Convert snake_case to camelCase
    const comments = rows.map(row => ({
      id: row.id.toString(),
      requestId: row.request_id.toString(),
      commentText: row.comment_text,
      commentedBy: row.commented_by,
      commentDate: row.comment_date
    }));
    
    res.json({
      message: 'success',
      data: comments
    });
  });
});

// Add a comment to a data subject request
app.post('/api/dsr/:requestId/comments', (req, res) => {
  const { commentText, commentedBy, commentDate } = req.body;
  
  if (!commentText || !commentedBy) {
    res.status(400).json({ error: 'Comment text and author are required' });
    return;
  }
  
  const sql = 'INSERT INTO dsr_comments (request_id, comment_text, commented_by, comment_date) VALUES (?, ?, ?, ?)';
  const params = [
    req.params.requestId,
    commentText,
    commentedBy,
    commentDate || new Date().toISOString().split('T')[0]
  ];
  
  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    
    res.json({
      message: 'success',
      data: {
        id: this.lastID.toString(),
        requestId: req.params.requestId,
        commentText,
        commentedBy,
        commentDate: params[3]
      }
    });
  });
});

// API endpoints for vendors
app.get('/api/vendors', (req, res) => {
  const organizationId = req.query.organizationId || '1'; // Default to org 1 for now
  const sql = 'SELECT * FROM Vendors WHERE organizationId = ? OR organizationId IS NULL';
  
  db.all(sql, [organizationId], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    
    // Convert snake_case to camelCase for frontend
    const vendors = rows.map(row => ({
      id: row.id.toString(),
      name: row.name,
      contactName: row.responsibleParty,
      contactEmail: row.email || '',
      phone: row.phone || '',
      address: row.address || '',
      description: row.description || '',
      dataProtectionOfficer: row.dpo || '',
      countryOfOperation: row.country || '',
      privacyPolicy: row.privacyPolicyUrl || '',
      certifications: [],
      organizational_unit_id: row.organizationId || ''
    }));
    
    res.json(vendors);
  });
});

app.get('/api/vendors/:id', (req, res) => {
  const sql = 'SELECT * FROM Vendors WHERE id = ?';
  
  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'Vendor not found' });
      return;
    }
    
    // Convert to frontend format
    const vendor = {
      id: row.id.toString(),
      name: row.name,
      contactName: row.responsibleParty,
      contactEmail: row.email || '',
      phone: row.phone || '',
      address: row.address || '',
      description: row.description || '',
      dataProtectionOfficer: row.dpo || '',
      countryOfOperation: row.country || '',
      privacyPolicy: row.privacyPolicyUrl || '',
      certifications: [],
      organizational_unit_id: row.organizationId || ''
    };
    
    res.json(vendor);
  });
});

app.post('/api/vendors', (req, res) => {
  const {
    name,
    contactName,
    contactEmail,
    phone,
    address,
    description,
    dataProtectionOfficer,
    countryOfOperation,
    privacyPolicy,
    organizational_unit_id
  } = req.body;
  
  if (!name) {
    res.status(400).json({ error: 'Vendor name is required' });
    return;
  }
  
  const id = `v${Date.now().toString().slice(-5)}`;
  const vendorId = `VEN-${Math.floor(Math.random() * 10000)}`;
  
  const sql = `
    INSERT INTO Vendors (
      id, vendorId, name, responsibleParty, email, phone, address, 
      description, dpo, country, privacyPolicyUrl, organizationId
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    id,
    vendorId,
    name,
    contactName,
    contactEmail,
    phone,
    address,
    description,
    dataProtectionOfficer,
    countryOfOperation,
    privacyPolicy,
    organizational_unit_id
  ];
  
  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    
    res.json({
      id,
      name,
      contactName,
      contactEmail,
      phone,
      address,
      description,
      dataProtectionOfficer,
      countryOfOperation,
      privacyPolicy,
      certifications: [],
      organizational_unit_id
    });
  });
});

app.put('/api/vendors/:id', (req, res) => {
  const {
    name,
    contactName,
    contactEmail,
    phone,
    address,
    description,
    dataProtectionOfficer,
    countryOfOperation,
    privacyPolicy,
    organizational_unit_id
  } = req.body;
  
  const { id } = req.params;
  
  const sql = `
    UPDATE Vendors SET
      name = COALESCE(?, name),
      responsibleParty = COALESCE(?, responsibleParty),
      email = COALESCE(?, email),
      phone = COALESCE(?, phone),
      address = COALESCE(?, address),
      description = COALESCE(?, description),
      dpo = COALESCE(?, dpo),
      country = COALESCE(?, country),
      privacyPolicyUrl = COALESCE(?, privacyPolicyUrl),
      organizationId = COALESCE(?, organizationId)
    WHERE id = ?
  `;
  
  const params = [
    name,
    contactName,
    contactEmail,
    phone,
    address,
    description,
    dataProtectionOfficer,
    countryOfOperation,
    privacyPolicy,
    organizational_unit_id,
    id
  ];
  
  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Vendor not found' });
      return;
    }
    
    res.json({
      id,
      name,
      contactName,
      contactEmail,
      phone,
      address,
      description,
      dataProtectionOfficer,
      countryOfOperation,
      privacyPolicy,
      certifications: [],
      organizational_unit_id
    });
  });
});

app.delete('/api/vendors/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM Vendors WHERE id = ?';
  
  db.run(sql, id, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Vendor not found' });
      return;
    }
    
    res.json({ success: true });
  });
});

// API endpoints for Data Breach Management

// Get all data breaches
app.get('/api/data-breaches', (req, res) => {
  const organizationId = req.query.organizationId;
  let sql = 'SELECT * FROM data_breaches ORDER BY detection_date DESC';
  let params = [];
  
  if (organizationId) {
    sql = 'SELECT * FROM data_breaches WHERE organizational_unit_id = ? ORDER BY detection_date DESC';
    params = [organizationId];
  }
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get a specific data breach
app.get('/api/data-breaches/:id', (req, res) => {
  const sql = 'SELECT * FROM data_breaches WHERE id = ?';
  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Data breach not found' });
      return;
    }
    res.json(row);
  });
});

// Create a new data breach
app.post('/api/data-breaches', (req, res) => {
  const {
    title,
    description,
    breach_date,
    detection_date,
    reported_by,
    affected_data_subjects,
    affected_data_types,
    affected_systems,
    severity,
    breach_type,
    potential_impact,
    organizational_unit_id
  } = req.body;
  
  if (!title || !breach_date || !detection_date || !reported_by || !breach_type) {
    res.status(400).json({ error: 'Required fields missing' });
    return;
  }
  
  const id = `db${Date.now().toString().slice(-6)}`;
  const created_at = new Date().toISOString();
  const updated_at = created_at;
  
  const sql = `
    INSERT INTO data_breaches (
      id, title, description, breach_date, detection_date, reported_by,
      affected_data_subjects, affected_data_types, affected_systems,
      severity, breach_type, potential_impact, organizational_unit_id,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    id, title, description, breach_date, detection_date, reported_by,
    affected_data_subjects, affected_data_types, affected_systems,
    severity || 'medium', breach_type, potential_impact, organizational_unit_id,
    created_at, updated_at
  ];
  
  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    
    db.get('SELECT * FROM data_breaches WHERE id = ?', [id], (err, row) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.status(201).json(row);
    });
  });
});

// Update a data breach
app.put('/api/data-breaches/:id', (req, res) => {
  const {
    title,
    description,
    breach_date,
    detection_date,
    reported_by,
    affected_data_subjects,
    affected_data_types,
    affected_systems,
    severity,
    breach_type,
    status,
    potential_impact,
    dpo_assessment,
    notify_authorities,
    notify_data_subjects,
    notification_date,
    organizational_unit_id,
    closed_at
  } = req.body;
  
  const updated_at = new Date().toISOString();
  
  const sql = `
    UPDATE data_breaches SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      breach_date = COALESCE(?, breach_date),
      detection_date = COALESCE(?, detection_date),
      reported_by = COALESCE(?, reported_by),
      affected_data_subjects = COALESCE(?, affected_data_subjects),
      affected_data_types = COALESCE(?, affected_data_types),
      affected_systems = COALESCE(?, affected_systems),
      severity = COALESCE(?, severity),
      breach_type = COALESCE(?, breach_type),
      status = COALESCE(?, status),
      potential_impact = COALESCE(?, potential_impact),
      dpo_assessment = COALESCE(?, dpo_assessment),
      notify_authorities = COALESCE(?, notify_authorities),
      notify_data_subjects = COALESCE(?, notify_data_subjects),
      notification_date = COALESCE(?, notification_date),
      organizational_unit_id = COALESCE(?, organizational_unit_id),
      updated_at = ?,
      closed_at = COALESCE(?, closed_at)
    WHERE id = ?
  `;
  
  const params = [
    title, description, breach_date, detection_date, reported_by,
    affected_data_subjects, affected_data_types, affected_systems,
    severity, breach_type, status, potential_impact, dpo_assessment,
    notify_authorities, notify_data_subjects, notification_date,
    organizational_unit_id, updated_at, closed_at, req.params.id
  ];
  
  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Data breach not found' });
      return;
    }
    
    db.get('SELECT * FROM data_breaches WHERE id = ?', [req.params.id], (err, row) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json(row);
    });
  });
});

// Delete a data breach
app.delete('/api/data-breaches/:id', (req, res) => {
  const sql = 'DELETE FROM data_breaches WHERE id = ?';
  db.run(sql, [req.params.id], function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Data breach not found' });
      return;
    }
    
    res.json({ message: 'Data breach deleted', id: req.params.id });
  });
});

// Breach Actions API

// Get all actions for a breach
app.get('/api/data-breaches/:breachId/actions', (req, res) => {
  const sql = 'SELECT * FROM breach_actions WHERE breach_id = ? ORDER BY action_date ASC';
  db.all(sql, [req.params.breachId], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create a new action for a breach
app.post('/api/data-breaches/:breachId/actions', (req, res) => {
  const {
    action_type,
    description,
    performed_by,
    action_date,
    status,
    notes
  } = req.body;
  
  if (!action_type || !description || !performed_by || !action_date) {
    res.status(400).json({ error: 'Required fields missing' });
    return;
  }
  
  const id = `ba${Date.now().toString().slice(-6)}`;
  const created_at = new Date().toISOString();
  
  const sql = `
    INSERT INTO breach_actions (
      id, breach_id, action_type, description, performed_by,
      action_date, status, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    id, req.params.breachId, action_type, description, performed_by,
    action_date, status || 'planned', notes, created_at
  ];
  
  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    
    db.get('SELECT * FROM breach_actions WHERE id = ?', [id], (err, row) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.status(201).json(row);
    });
  });
});

// Update an action for a breach
app.put('/api/data-breaches/:breachId/actions/:actionId', (req, res) => {
  const {
    action_type,
    description,
    performed_by,
    action_date,
    status,
    notes
  } = req.body;
  
  const sql = `
    UPDATE breach_actions SET
      action_type = COALESCE(?, action_type),
      description = COALESCE(?, description),
      performed_by = COALESCE(?, performed_by),
      action_date = COALESCE(?, action_date),
      status = COALESCE(?, status),
      notes = COALESCE(?, notes)
    WHERE id = ? AND breach_id = ?
  `;
  
  const params = [
    action_type, description, performed_by, action_date, status, notes,
    req.params.actionId, req.params.breachId
  ];
  
  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Action not found' });
      return;
    }
    
    db.get('SELECT * FROM breach_actions WHERE id = ?', [req.params.actionId], (err, row) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json(row);
    });
  });
});

// Breach Notifications API

// Get all notifications for a breach
app.get('/api/data-breaches/:breachId/notifications', (req, res) => {
  const sql = 'SELECT * FROM breach_notifications WHERE breach_id = ? ORDER BY notification_date DESC';
  db.all(sql, [req.params.breachId], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create a new notification for a breach
app.post('/api/data-breaches/:breachId/notifications', (req, res) => {
  const {
    notification_type,
    recipient,
    notification_date,
    notification_method,
    content,
    response_received,
    response_date,
    response_details
  } = req.body;
  
  if (!notification_type || !recipient || !notification_date || !notification_method) {
    res.status(400).json({ error: 'Required fields missing' });
    return;
  }
  
  const id = `bn${Date.now().toString().slice(-6)}`;
  const created_at = new Date().toISOString();
  
  const sql = `
    INSERT INTO breach_notifications (
      id, breach_id, notification_type, recipient, notification_date, 
      notification_method, content, response_received, response_date, 
      response_details, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    id, req.params.breachId, notification_type, recipient, notification_date,
    notification_method, content, response_received || 0, response_date,
    response_details, created_at
  ];
  
  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    
    db.get('SELECT * FROM breach_notifications WHERE id = ?', [id], (err, row) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.status(201).json(row);
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 