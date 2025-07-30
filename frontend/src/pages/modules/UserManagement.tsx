import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  organizationId: string;
}

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<User>({
    id: '',
    name: '',
    email: '',
    role: 'user',
    organizationId: currentUser?.organizationId || ''
  });

  useEffect(() => {
    // Fetch users from the backend
    fetch('/api/users')
      .then(response => response.json())
      .then(data => setUsers(data.data))
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddUser = () => {
    setFormData({
      id: '',
      name: '',
      email: '',
      role: 'user',
      organizationId: currentUser?.organizationId || ''
    });
    setIsEditing(true);
  };

  const validateEmail = (email: string) => {
    const re = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/;
    return re.test(email);
  };

  const handleSaveUser = () => {
    if (!formData.name || !formData.email) {
      alert('Name and email are required');
      return;
    }

    if (!validateEmail(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id ? `/api/users/${formData.id}` : '/api/users';

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
      .then(response => response.json())
      .then(data => {
        if (method === 'POST') {
          setUsers([...users, data.data]);
        } else {
          setUsers(users.map(user => user.id === data.data.id ? data.data : user));
        }
        setIsEditing(false);
      })
      .catch(error => console.error('Error saving user:', error));
  };

  const handleEditUser = (user: User) => {
    setFormData(user);
    setIsEditing(true);
  };

  const handleDeleteUser = (userId: string) => {
    fetch(`/api/users/${userId}`, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(() => {
        setUsers(users.filter(user => user.id !== userId));
      })
      .catch(error => console.error('Error deleting user:', error));
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h2>User Management</h2>
        <button className="primary-button" onClick={handleAddUser}>
          Add User
        </button>
      </div>

      {isEditing && (
        <div className="user-form" style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Name" style={{ marginBottom: '10px', padding: '8px', width: '100%' }} />
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" style={{ marginBottom: '10px', padding: '8px', width: '100%' }} />
          <select name="role" value={formData.role} onChange={handleInputChange} style={{ marginBottom: '10px', padding: '8px', width: '100%' }}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={handleSaveUser} style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }}>Save</button>
          <button onClick={() => setIsEditing(false)} style={{ padding: '8px 16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px' }}>Cancel</button>
        </div>
      )}

      <div className="user-list" style={{ borderTop: '1px solid #ccc', paddingTop: '10px' }}>
        {users.map(user => (
          <div key={user.id} className="user-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
            <span>{user.name} ({user.role})</span>
            <div>
              <button onClick={() => handleEditUser(user)} style={{ marginRight: '10px', padding: '5px 10px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '5px' }}>Edit</button>
              <button onClick={() => handleDeleteUser(user.id)} style={{ padding: '5px 10px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement; 