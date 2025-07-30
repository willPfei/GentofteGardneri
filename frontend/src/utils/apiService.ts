import axios from 'axios';
import { System } from '../pages/modules/Systems';
import { ProcessingActivity } from '../pages/modules/Activities';
import { Vendor } from '../utils/csvUtils';

// Define data breach types
export interface DataBreach {
  id: string;
  title: string;
  description?: string;
  breach_date: string;
  detection_date: string;
  reported_by: string;
  affected_data_subjects?: string;
  affected_data_types?: string;
  affected_systems?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  breach_type: 'confidentiality' | 'integrity' | 'availability' | 'multiple';
  status: 'detected' | 'assessed' | 'contained' | 'notified' | 'recovered' | 'analyzed' | 'closed';
  potential_impact?: string;
  dpo_assessment?: string;
  notify_authorities: boolean;
  notify_data_subjects: boolean;
  notification_date?: string;
  organizational_unit_id?: string;
  created_at?: string;
  updated_at?: string;
  closed_at?: string;
}

export interface BreachAction {
  id: string;
  breach_id: string;
  action_type: 'containment' | 'eradication' | 'recovery' | 'notification' | 'analysis' | 'prevention';
  description: string;
  performed_by: string;
  action_date: string;
  status: 'planned' | 'in-progress' | 'completed' | 'failed';
  notes?: string;
  created_at?: string;
}

export interface BreachNotification {
  id: string;
  breach_id: string;
  notification_type: 'authority' | 'data_subject' | 'internal' | 'other';
  recipient: string;
  notification_date: string;
  notification_method: 'email' | 'letter' | 'phone' | 'in-person' | 'other';
  content?: string;
  response_received: boolean;
  response_date?: string;
  response_details?: string;
  created_at?: string;
}

export interface BreachAnalysis {
  id: string;
  breach_id: string;
  root_cause?: string;
  impact_assessment?: string;
  lessons_learned?: string;
  recommended_actions?: string;
  analyzed_by: string;
  analysis_date: string;
  reviewed_by?: string;
  review_date?: string;
  created_at?: string;
}

export interface BreachPrevention {
  id: string;
  breach_id: string;
  measure_type: 'technical' | 'organizational' | 'training' | 'policy' | 'other';
  description: string;
  assigned_to: string;
  deadline?: string;
  status: 'planned' | 'in-progress' | 'implemented' | 'verified' | 'cancelled';
  implementation_date?: string;
  verification_date?: string;
  notes?: string;
  created_at?: string;
}

// Base URL for API calls
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with common configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth tokens if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Systems API endpoints
export const systemsApi = {
  getAll: async (): Promise<System[]> => {
    try {
      const response = await api.get<System[]>('/systems');
      return response.data;
    } catch (error) {
      console.error('Error fetching systems:', error);
      // Fallback to localStorage if API request fails
      const savedSystems = localStorage.getItem('ropa_systems');
      return savedSystems ? JSON.parse(savedSystems) : [];
    }
  },
  
  create: async (systemData: Omit<System, 'id'>): Promise<System> => {
    try {
      const response = await api.post<System>('/systems', systemData);
      return response.data;
    } catch (error) {
      console.error('Error creating system:', error);
      // Fallback implementation for demo purposes
      const savedSystems = localStorage.getItem('ropa_systems');
      const systems = savedSystems ? JSON.parse(savedSystems) : [];
      const newSystem = {
        id: `s${Date.now().toString().slice(-5)}`,
        ...systemData,
      };
      const updatedSystems = [...systems, newSystem];
      localStorage.setItem('ropa_systems', JSON.stringify(updatedSystems));
      return newSystem;
    }
  },
  
  update: async (id: string, systemData: Partial<System>): Promise<System> => {
    try {
      const response = await api.put<System>(`/systems/${id}`, systemData);
      return response.data;
    } catch (error) {
      console.error('Error updating system:', error);
      // Fallback implementation for demo purposes
      const savedSystems = localStorage.getItem('ropa_systems');
      const systems: System[] = savedSystems ? JSON.parse(savedSystems) : [];
      const updatedSystems = systems.map(system => 
        system.id === id ? { ...system, ...systemData } : system
      );
      localStorage.setItem('ropa_systems', JSON.stringify(updatedSystems));
      return { ...systemData, id } as System;
    }
  },
  
  delete: async (id: string): Promise<{ success: boolean }> => {
    try {
      await api.delete(`/systems/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting system:', error);
      // Fallback implementation for demo purposes
      const savedSystems = localStorage.getItem('ropa_systems');
      const systems: System[] = savedSystems ? JSON.parse(savedSystems) : [];
      const updatedSystems = systems.filter(system => system.id !== id);
      localStorage.setItem('ropa_systems', JSON.stringify(updatedSystems));
      return { success: true };
    }
  }
};

// Activities API endpoints
export const activitiesApi = {
  getAll: async (): Promise<ProcessingActivity[]> => {
    try {
      const response = await api.get<ProcessingActivity[]>('/activities');
      return response.data;
    } catch (error) {
      console.error('Error fetching activities:', error);
      // Fallback to localStorage if API request fails
      const savedActivities = localStorage.getItem('ropa_activities');
      return savedActivities ? JSON.parse(savedActivities) : [];
    }
  },
  
  create: async (activityData: Omit<ProcessingActivity, 'id'>): Promise<ProcessingActivity> => {
    try {
      const response = await api.post<ProcessingActivity>('/activities', activityData);
      return response.data;
    } catch (error) {
      console.error('Error creating activity:', error);
      // Fallback implementation for demo purposes
      const savedActivities = localStorage.getItem('ropa_activities');
      const activities = savedActivities ? JSON.parse(savedActivities) : [];
      const newActivity = {
        id: `a${Date.now().toString().slice(-5)}`,
        ...activityData,
      };
      const updatedActivities = [...activities, newActivity];
      localStorage.setItem('ropa_activities', JSON.stringify(updatedActivities));
      return newActivity;
    }
  },
  
  update: async (id: string, activityData: Partial<ProcessingActivity>): Promise<ProcessingActivity> => {
    try {
      const response = await api.put<ProcessingActivity>(`/activities/${id}`, activityData);
      return response.data;
    } catch (error) {
      console.error('Error updating activity:', error);
      // Fallback implementation for demo purposes
      const savedActivities = localStorage.getItem('ropa_activities');
      const activities: ProcessingActivity[] = savedActivities ? JSON.parse(savedActivities) : [];
      const updatedActivities = activities.map(activity => 
        activity.id === id ? { ...activity, ...activityData } : activity
      );
      localStorage.setItem('ropa_activities', JSON.stringify(updatedActivities));
      return { ...activityData, id } as ProcessingActivity;
    }
  },
  
  delete: async (id: string): Promise<{ success: boolean }> => {
    try {
      await api.delete(`/activities/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting activity:', error);
      // Fallback implementation for demo purposes
      const savedActivities = localStorage.getItem('ropa_activities');
      const activities: ProcessingActivity[] = savedActivities ? JSON.parse(savedActivities) : [];
      const updatedActivities = activities.filter(activity => activity.id !== id);
      localStorage.setItem('ropa_activities', JSON.stringify(updatedActivities));
      return { success: true };
    }
  }
};

// Vendors API endpoints
export const vendorsApi = {
  getAll: async (): Promise<Vendor[]> => {
    try {
      const response = await api.get<Vendor[]>('/vendors');
      return response.data;
    } catch (error) {
      console.error('Error fetching vendors:', error);
      // Fallback to localStorage if API request fails
      const savedVendors = localStorage.getItem('ropa_vendors');
      return savedVendors ? JSON.parse(savedVendors) : [];
    }
  },
  
  create: async (vendorData: Omit<Vendor, 'id'>): Promise<Vendor> => {
    try {
      console.log('Attempting to create vendor with data:', vendorData);
      console.log('API URL being called:', `${API_BASE_URL}/vendors`);
      
      const response = await api.post<Vendor>('/vendors', vendorData);
      console.log('Vendor creation successful. Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating vendor:', error);
      
      // Add more detailed error logging
      if (axios.isAxiosError(error)) {
        console.error('API Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
          method: error.config?.method,
          message: error.message
        });
      }
      
      // Fallback implementation for demo purposes
      const savedVendors = localStorage.getItem('ropa_vendors');
      const vendors = savedVendors ? JSON.parse(savedVendors) : [];
      const newVendor = {
        id: `v${Date.now().toString().slice(-5)}`,
        ...vendorData,
      };
      const updatedVendors = [...vendors, newVendor];
      localStorage.setItem('ropa_vendors', JSON.stringify(updatedVendors));
      return newVendor;
    }
  },
  
  update: async (id: string, vendorData: Partial<Vendor>): Promise<Vendor> => {
    try {
      const response = await api.put<Vendor>(`/vendors/${id}`, vendorData);
      return response.data;
    } catch (error) {
      console.error('Error updating vendor:', error);
      // Fallback implementation for demo purposes
      const savedVendors = localStorage.getItem('ropa_vendors');
      const vendors: Vendor[] = savedVendors ? JSON.parse(savedVendors) : [];
      const updatedVendors = vendors.map(vendor => 
        vendor.id === id ? { ...vendor, ...vendorData } : vendor
      );
      localStorage.setItem('ropa_vendors', JSON.stringify(updatedVendors));
      return { ...vendorData, id } as Vendor;
    }
  },
  
  delete: async (id: string): Promise<{ success: boolean }> => {
    try {
      await api.delete(`/vendors/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting vendor:', error);
      // Fallback implementation for demo purposes
      const savedVendors = localStorage.getItem('ropa_vendors');
      const vendors: Vendor[] = savedVendors ? JSON.parse(savedVendors) : [];
      const updatedVendors = vendors.filter(vendor => vendor.id !== id);
      localStorage.setItem('ropa_vendors', JSON.stringify(updatedVendors));
      return { success: true };
    }
  }
};

// Data Breach API endpoints
export const dataBreachApi = {
  // Data Breaches
  getAllBreaches: async (organizationId?: string): Promise<DataBreach[]> => {
    try {
      console.log('API Call: Getting all data breaches');
      const params = organizationId ? { organizationId } : {};
      console.log('API URL:', `${API_BASE_URL}/data-breaches`, 'Params:', params);
      const response = await api.get<DataBreach[]>('/data-breaches', { params });
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching data breaches:', error);
      
      // Add more detailed error logging
      if (axios.isAxiosError(error)) {
        console.error('API Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
      }
      
      // For demo purposes, return mock data if API fails
      console.log('Returning mock data for demonstration');
      return [
        {
          id: 'db123456',
          title: 'Demo Data Breach',
          description: 'This is a demo data breach for testing purposes.',
          breach_date: '2023-01-15',
          detection_date: '2023-01-20',
          reported_by: 'System Admin',
          severity: 'high',
          breach_type: 'confidentiality',
          status: 'assessed',
          notify_authorities: true,
          notify_data_subjects: false,
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
          severity: 'medium',
          breach_type: 'integrity',
          status: 'contained',
          notify_authorities: false,
          notify_data_subjects: false,
          created_at: '2023-02-12T14:15:00Z',
          updated_at: '2023-02-15T09:45:00Z'
        }
      ];
    }
  },
  
  getBreach: async (id: string): Promise<DataBreach | null> => {
    try {
      const response = await api.get<DataBreach>(`/data-breaches/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching data breach ${id}:`, error);
      return null;
    }
  },
  
  createBreach: async (breachData: Omit<DataBreach, 'id' | 'created_at' | 'updated_at'>): Promise<DataBreach | null> => {
    try {
      const response = await api.post<DataBreach>('/data-breaches', breachData);
      return response.data;
    } catch (error) {
      console.error('Error creating data breach:', error);
      return null;
    }
  },
  
  updateBreach: async (id: string, breachData: Partial<DataBreach>): Promise<DataBreach | null> => {
    try {
      const response = await api.put<DataBreach>(`/data-breaches/${id}`, breachData);
      return response.data;
    } catch (error) {
      console.error(`Error updating data breach ${id}:`, error);
      return null;
    }
  },
  
  deleteBreach: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/data-breaches/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting data breach ${id}:`, error);
      return false;
    }
  },
  
  // Breach Actions
  getBreachActions: async (breachId: string): Promise<BreachAction[]> => {
    try {
      const response = await api.get<BreachAction[]>(`/data-breaches/${breachId}/actions`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching actions for breach ${breachId}:`, error);
      return [];
    }
  },
  
  createBreachAction: async (breachId: string, actionData: Omit<BreachAction, 'id' | 'breach_id' | 'created_at'>): Promise<BreachAction | null> => {
    try {
      const response = await api.post<BreachAction>(`/data-breaches/${breachId}/actions`, actionData);
      return response.data;
    } catch (error) {
      console.error(`Error creating action for breach ${breachId}:`, error);
      return null;
    }
  },
  
  updateBreachAction: async (breachId: string, actionId: string, actionData: Partial<BreachAction>): Promise<BreachAction | null> => {
    try {
      const response = await api.put<BreachAction>(`/data-breaches/${breachId}/actions/${actionId}`, actionData);
      return response.data;
    } catch (error) {
      console.error(`Error updating action ${actionId} for breach ${breachId}:`, error);
      return null;
    }
  },
  
  // Breach Notifications
  getBreachNotifications: async (breachId: string): Promise<BreachNotification[]> => {
    try {
      const response = await api.get<BreachNotification[]>(`/data-breaches/${breachId}/notifications`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching notifications for breach ${breachId}:`, error);
      return [];
    }
  },
  
  createBreachNotification: async (breachId: string, notificationData: Omit<BreachNotification, 'id' | 'breach_id' | 'created_at'>): Promise<BreachNotification | null> => {
    try {
      const response = await api.post<BreachNotification>(`/data-breaches/${breachId}/notifications`, notificationData);
      return response.data;
    } catch (error) {
      console.error(`Error creating notification for breach ${breachId}:`, error);
      return null;
    }
  },
  
  updateBreachNotification: async (breachId: string, notificationId: string, notificationData: Partial<BreachNotification>): Promise<BreachNotification | null> => {
    try {
      const response = await api.put<BreachNotification>(`/data-breaches/${breachId}/notifications/${notificationId}`, notificationData);
      return response.data;
    } catch (error) {
      console.error(`Error updating notification ${notificationId} for breach ${breachId}:`, error);
      return null;
    }
  }
};

// Organization API endpoints
export const organizationApi = {
  getOrganization: async () => {
    try {
      const response = await api.get('/organization');
      return response.data;
    } catch (error) {
      console.error('Error fetching organization:', error);
      // Fallback to localStorage
      const savedOrg = localStorage.getItem('organization');
      return savedOrg ? JSON.parse(savedOrg) : null;
    }
  },
  
  getOrganizationalUnits: async () => {
    try {
      const response = await api.get('/organization/units');
      return response.data;
    } catch (error) {
      console.error('Error fetching organizational units:', error);
      // Fallback to localStorage
      const savedUnits = localStorage.getItem('organizationalUnits');
      return savedUnits ? JSON.parse(savedUnits) : [];
    }
  },
  
  updateOrganization: async (orgData: any) => {
    try {
      const response = await api.put('/organization', orgData);
      return response.data;
    } catch (error) {
      console.error('Error updating organization:', error);
      // Fallback to localStorage
      localStorage.setItem('organization', JSON.stringify(orgData));
      return orgData;
    }
  },
  
  createUnit: async (unitData: any) => {
    try {
      const response = await api.post('/organization/units', unitData);
      return response.data;
    } catch (error) {
      console.error('Error creating organizational unit:', error);
      // Fallback to localStorage
      const savedUnits = localStorage.getItem('organizationalUnits');
      const units = savedUnits ? JSON.parse(savedUnits) : [];
      const newUnit = {
        id: `ou${Date.now().toString().slice(-5)}`,
        ...unitData,
      };
      const updatedUnits = [...units, newUnit];
      localStorage.setItem('organizationalUnits', JSON.stringify(updatedUnits));
      return newUnit;
    }
  }
};

export default api; 