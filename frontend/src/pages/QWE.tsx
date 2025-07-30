import React, { useState, useEffect } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/dashboard.css';
import OrganizationSelector from '../components/OrganizationSelector';
import { useOrganization } from '../context/OrganizationContext';

// Interactive Dashboard with compliance score, notifications, and tabbed interface
interface Metrics {
  vendors: number;
  systems: number;
  activities: number;
}

interface Vendor {
  id: string;
  organizational_unit_id?: string;
  // other fields...
}

interface System {
  id: string;
  organizational_unit_id?: string;
  // other fields...
}

interface ProcessingActivity {
  id: string;
  organizational_unit_id?: string;
  // other fields...
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [metrics, setMetrics] = useState<Metrics>({
    vendors: 0,
    systems: 0,
    activities: 0
  });
  const [currentUser, setCurrentUser] = useState<{ name: string; organizationId: string } | null>(null);
  const [organizationName, setOrganizationName] = useState('');
  const [allVendors, setAllVendors] = useState<Vendor[]>([]);
  const [allSystems, setAllSystems] = useState<System[]>([]);
  const [allActivities, setAllActivities] = useState<ProcessingActivity[]>([]);
  
  const { selectedEntityId, isChildOfSelectedEntity } = useOrganization();
  
  useEffect(() => {
    // Get current user from localStorage
    const currentUserJson = localStorage.getItem('currentUser');
    if (currentUserJson) {
      const parsedUser = JSON.parse(currentUserJson);
      setUserName(parsedUser.name);
      setCurrentUser(parsedUser);
      // Retrieve organization name from localStorage
      const orgName = localStorage.getItem('organizationName');
      setOrganizationName(parsedUser.organizationName || 'Unknown Organization');
    }

    // Get data from localStorage
    const vendorsJson = localStorage.getItem('ropa_vendors');
    const systemsJson = localStorage.getItem('ropa_systems');
    const activitiesJson = localStorage.getItem('ropa_activities');

    // Store all data
    setAllVendors(vendorsJson ? JSON.parse(vendorsJson) : []);
    setAllSystems(systemsJson ? JSON.parse(systemsJson) : []);
    setAllActivities(activitiesJson ? JSON.parse(activitiesJson) : []);
  }, []);
  
  // Filter metrics based on selected entity
  useEffect(() => {
    if (!selectedEntityId) {
      // If no entity is selected, show all
      setMetrics({
        vendors: allVendors.length,
        systems: allSystems.length,
        activities: allActivities.length
      });
    } else {
      // Filter based on selected entity ID and its children
      const filteredVendors = allVendors.filter(vendor => 
        vendor.organizational_unit_id === selectedEntityId || 
        isChildOfSelectedEntity(vendor.organizational_unit_id)
      );
      
      const filteredSystems = allSystems.filter(system => 
        system.organizational_unit_id === selectedEntityId || 
        isChildOfSelectedEntity(system.organizational_unit_id)
      );
      
      const filteredActivities = allActivities.filter(activity => 
        activity.organizational_unit_id === selectedEntityId || 
        isChildOfSelectedEntity(activity.organizational_unit_id)
      );
      
      setMetrics({
        vendors: filteredVendors.length,
        systems: filteredSystems.length,
        activities: filteredActivities.length
      });
    }
  }, [selectedEntityId, allVendors, allSystems, allActivities, isChildOfSelectedEntity]);

  const modules = [
    {
      id: 'organization-info',
      title: 'Organization Information',
      description: 'Manage organization details and GDPR-relevant info for reports.',
      icon: '🏢',
      color: 'var(--accent-color)',
      path: '/organization-info'
    },
    {
      id: 'vendors',
      title: 'Vendor Management',
      description: 'Track vendors, DPOs, and privacy policies for compliance.',
      icon: '🏭',
      color: 'var(--primary-color)',
      path: '/modules/vendors'
    },
    {
      id: 'systems',
      title: 'IT Systems Inventory',
      description: 'Track IT systems, ownership, and connections to vendors.',
      icon: '💻',
      color: 'var(--primary-color)',
      path: '/modules/systems'
    },
    {
      id: 'activities',
      title: 'Processing Activities',
      description: 'Document GDPR-compliant processing activities.',
      icon: '📊',
      color: 'var(--primary-color)',
      path: '/modules/activities'
    },
    {
      id: 'risk-assessments',
      title: 'Risk Assessments',
      description: 'Identify privacy risks and document controls.',
      icon: '⚠️',
      color: 'var(--primary-color)',
      path: '/modules/risk-assessments'
    },
    {
      id: 'risk-management',
      title: 'Risk Management',
      description: 'Monitor risks and implement mitigations.',
      icon: '🔍',
      color: 'var(--primary-color)',
      path: '/modules/risk-management'
    },
    {
      id: 'data-subjects-requests',
      title: 'Data Subject Requests',
      description: 'Manage all types of data subject requests.',
      icon: '📥',
      color: 'var(--primary-color)',
      path: '/modules/data-subjects-requests'
    },
    {
      id: 'data-breach-management',
      title: 'Data Breach Management',
      description: 'Document breaches and response actions.',
      icon: '🚨',
      color: 'var(--primary-color)',
      path: '/modules/data-breach-management'
    },
    {
      id: 'maturity-assessments',
      title: 'Maturity Assessments',
      description: 'Evaluate privacy program compliance.',
      icon: '📈',
      color: 'var(--primary-color)',
      path: '/modules/maturity-assessments'
    },
    {
      id: 'governance-framework',
      title: 'Governance Framework',
      description: 'Manage privacy policies and documentation.',
      icon: '📚',
      color: 'var(--primary-color)',
      path: '/modules/governance-framework'
    },
    {
      id: 'generate-reports',
      title: 'Generate Reports',
      description: 'Create reports for compliance requirements.',
      icon: '📄',
      color: 'var(--primary-color)',
      path: '/modules/generate-reports'
    },
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Manage users within your organization.',
      icon: '👥',
      color: 'var(--primary-color)',
      path: '/modules/user-management'
    },
    {
      id: 'security-risk-management',
      title: 'Security Risk Management',
      description: 'Identify, assess, and mitigate security risks across your organization, with a focus on enterprise-wide risk management.',
      icon: '🔒',
      color: 'var(--primary-color)',
      path: '/modules/security-risk-management'
    },
    {
      id: 'asset-management',
      title: 'Asset Management',
      description: 'Maintain a centralized inventory of your organization\'s assets, including hardware, software, and third-party dependencies.',
      icon: '📦',
      color: 'var(--primary-color)',
      path: '/modules/asset-management'
    },
    {
      id: 'supply-chain-security',
      title: 'Supply Chain Security',
      description: 'Manage requirements, surveys, compliance controls, and due diligence for third-party vendors and suppliers.',
      icon: '🌐',
      color: 'var(--primary-color)',
      path: '/modules/supply-chain-security'
    }
  ];

  const handleLogout = () => {
    // Clear authentication state
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const handleSettingsClick = () => {
    setShowSettingsMenu(!showSettingsMenu);
  };

  const handleProfileSettings = () => {
    // In a real app, navigate to profile settings
    alert('Profile settings would open here');
    setShowSettingsMenu(false);
  };

  const handleAccountSettings = () => {
    // In a real app, navigate to account settings
    alert('Account settings would open here');
    setShowSettingsMenu(false);
  };
  
  const handleModuleClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <img src="https://whitelabelconsultancy.com/Content/WLCLOGO.png" alt="WLC Logo" className="wlc-logo" />
          <h1 className="dashboard-title">Digital Risk Management Dashboard</h1>
          <div className="user-menu">
            <OrganizationSelector />
            <span className="user-name">User: {userName}</span>
            <span className="user-organization">Organization: {organizationName}</span>
            <div className="settings-container">
              <button onClick={handleSettingsClick} className="settings-button" aria-label="Settings">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 13.75C12.0711 13.75 13.75 12.0711 13.75 10C13.75 7.92893 12.0711 6.25 10 6.25C7.92893 6.25 6.25 7.92893 6.25 10C6.25 12.0711 7.92893 13.75 10 13.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16.1667 10C16.1667 10 16.5 9.33333 16.5 8.33333C16.5 7.33333 16.1667 6.66667 16.1667 6.66667M3.83333 10C3.83333 10 3.5 9.33333 3.5 8.33333C3.5 7.33333 3.83333 6.66667 3.83333 6.66667M16.1667 13.3333C16.1667 13.3333 16.5 14 16.5 15C16.5 16 16.1667 16.6667 16.1667 16.6667M3.83333 13.3333C3.83333 13.3333 3.5 14 3.5 15C3.5 16 3.83333 16.6667 3.83333 16.6667M16.1667 6.66667C15.0833 4.5 12.75 3 10 3C7.25 3 4.91667 4.5 3.83333 6.66667M16.1667 16.6667C15.0833 18.8333 12.75 20.3333 10 20.3333C7.25 20.3333 4.91667 18.8333 3.83333 16.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {showSettingsMenu && (
                <div className="settings-dropdown">
                  <button onClick={handleProfileSettings}>Profile Settings</button>
                  <button onClick={handleAccountSettings}>Account Settings</button>
                  <button onClick={handleLogout}>Sign Out</button>
                </div>
              )}
            </div>
            <button onClick={handleLogout} className="logout-button">Sign Out</button>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="welcome-section">
          <h2 className="welcome-title">Welcome, {userName}</h2>
          <p className="welcome-subtitle">Here's an overview of your compliance activities</p>
        </section>

        <section className="modules-section">
          <h3 className="modules-title">Digital Risk Management Modules</h3>
          <div className="module-grid">
            {modules.map(module => (
              <div 
                key={module.id} 
                className="module-card"
                onClick={() => handleModuleClick(module.path)}
              >
                <div className="module-icon" style={{ backgroundColor: `${module.color}20`, color: module.color }}>
                  {module.icon}
                </div>
                <h4 className="module-title">{module.title}</h4>
                <p className="module-description">{module.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="stats-section">
          <h3 className="stats-title">Key Metrics</h3>
          <div className="stat-cards">
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: `${modules[1].color}20`, color: modules[1].color }}>
                {modules[1].icon}
              </div>
              <div className="stat-info">
                <h4 className="stat-title">Vendors</h4>
                <div className="stat-count">{metrics.vendors}</div>
                <p className="stat-description">Active vendors</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: `${modules[2].color}20`, color: modules[2].color }}>
                {modules[2].icon}
              </div>
              <div className="stat-info">
                <h4 className="stat-title">IT Systems</h4>
                <div className="stat-count">{metrics.systems}</div>
                <p className="stat-description">Registered systems</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: `${modules[3].color}20`, color: modules[3].color }}>
                {modules[3].icon}
              </div>
              <div className="stat-info">
                <h4 className="stat-title">Activities</h4>
                <div className="stat-count">{metrics.activities}</div>
                <p className="stat-description">Processing activities</p>
              </div>
            </div>
          </div>
        </section>

        <section className="activity-section">
          <h3 className="activity-title">Recent Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-dot"></div>
              <div className="activity-content">
                <p className="activity-description">View your recent activities in each module</p>
                <span className="activity-time">Click on a module to get started</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="dashboard-footer">
        <p className="footer-text">© {new Date().getFullYear()} RoPA Platform • Your Digital Risk Management Solution</p>
      </footer>
    </div>
  );
};

export default Dashboard;
