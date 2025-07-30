import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

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

interface OrganizationContextType {
  selectedEntityId: string | null;
  selectedEntityName: string;
  setSelectedEntity: (id: string | null, name: string) => void;
  organization: Organization | null;
  organizationalUnits: OrganizationalUnit[];
  loadOrganizationData: () => Promise<void>;
  getEntityName: (id: string) => string;
  isEntitySelected: (entityId: string | undefined) => boolean;
  isChildOfSelectedEntity: (entityId: string | undefined) => boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

interface OrganizationProviderProps {
  children: ReactNode;
}

export const OrganizationProvider = ({ children }: OrganizationProviderProps) => {
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(
    localStorage.getItem('selectedEntityId')
  );
  const [selectedEntityName, setSelectedEntityName] = useState<string>(
    localStorage.getItem('selectedEntityName') || 'All Entities'
  );
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [organizationalUnits, setOrganizationalUnits] = useState<OrganizationalUnit[]>([]);

  // Load organization data from localStorage
  const loadOrganizationData = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        console.log('Loading organization data from localStorage');
        const savedOrg = localStorage.getItem('organization');
        if (savedOrg) {
          setOrganization(JSON.parse(savedOrg));
        } else {
          // Use fallback data if nothing is in localStorage
          const fallbackOrg = {
            id: 'org-default',
            name: 'Default Organization',
            description: 'Default organization for demonstration',
            address: '123 Main St',
            country: 'US',
            industry: 'Technology',
            primary_contact: 'Admin User',
            primary_email: 'admin@example.com',
            phone: '555-123-4567',
            website: 'www.example.com'
          };
          setOrganization(fallbackOrg);
          localStorage.setItem('organization', JSON.stringify(fallbackOrg));
          console.log('Created fallback organization data');
        }

        const savedUnits = localStorage.getItem('organizationalUnits');
        if (savedUnits) {
          setOrganizationalUnits(JSON.parse(savedUnits));
        } else {
          // Use fallback data if nothing is in localStorage
          const fallbackUnits = [
            {
              id: 'dept-1',
              name: 'IT Department',
              unit_type: 'DEPARTMENT' as const,
              description: 'Information Technology Department',
              organization_id: 'org-default',
              parent_unit_id: null,
              address: '123 Main St',
              contact_person: 'IT Manager',
              contact_email: 'it@example.com',
              phone: '555-123-4567'
            },
            {
              id: 'dept-2',
              name: 'HR Department',
              unit_type: 'DEPARTMENT' as const,
              description: 'Human Resources Department',
              organization_id: 'org-default',
              parent_unit_id: null,
              address: '123 Main St',
              contact_person: 'HR Manager',
              contact_email: 'hr@example.com',
              phone: '555-123-4568'
            }
          ];
          setOrganizationalUnits(fallbackUnits);
          localStorage.setItem('organizationalUnits', JSON.stringify(fallbackUnits));
          console.log('Created fallback organizational units data');
        }
        
        // Wait for state updates to complete before resolving
        setTimeout(() => resolve(), 0);
      } catch (error) {
        console.error('Error loading organization data:', error);
        // Use fallback data in case of any errors
        const fallbackOrg = {
          id: 'org-default',
          name: 'Default Organization',
          description: 'Default organization for demonstration',
          address: '123 Main St',
          country: 'US',
          industry: 'Technology',
          primary_contact: 'Admin User',
          primary_email: 'admin@example.com',
          phone: '555-123-4567',
          website: 'www.example.com'
        };
        setOrganization(fallbackOrg);
        
        const fallbackUnits = [
          {
            id: 'dept-1',
            name: 'IT Department',
            unit_type: 'DEPARTMENT' as const,
            description: 'Information Technology Department',
            organization_id: 'org-default',
            parent_unit_id: null,
            address: '123 Main St',
            contact_person: 'IT Manager',
            contact_email: 'it@example.com',
            phone: '555-123-4567'
          }
        ];
        setOrganizationalUnits(fallbackUnits);
        
        // Wait for state updates to complete before resolving
        setTimeout(() => resolve(), 0);
      }
    });
  };

  useEffect(() => {
    loadOrganizationData();
  }, []);

  // Persist selected entity to localStorage
  useEffect(() => {
    if (selectedEntityId) {
      localStorage.setItem('selectedEntityId', selectedEntityId);
    } else {
      localStorage.removeItem('selectedEntityId');
    }
    
    localStorage.setItem('selectedEntityName', selectedEntityName);
  }, [selectedEntityId, selectedEntityName]);

  const setSelectedEntity = (id: string | null, name: string) => {
    setSelectedEntityId(id);
    setSelectedEntityName(name || 'All Entities');
  };

  // Get entity name by ID
  const getEntityName = (id: string): string => {
    if (organization && id === organization.id) {
      return organization.name;
    }
    
    const unit = organizationalUnits.find(unit => unit.id === id);
    return unit ? unit.name : 'Unknown Entity';
  };

  // Check if an entity is selected or is the selected entity
  const isEntitySelected = (entityId: string | undefined): boolean => {
    if (!entityId || !selectedEntityId) return false;
    return entityId === selectedEntityId;
  };

  // Recursive function to get all child IDs of a parent unit
  const getAllChildrenIds = (parentId: string): string[] => {
    const directChildren = organizationalUnits.filter(
      unit => unit.parent_unit_id === parentId
    );
    
    if (directChildren.length === 0) {
      return [];
    }
    
    const childIds = directChildren.map(child => child.id);
    const grandChildrenIds = directChildren.flatMap(child => 
      getAllChildrenIds(child.id)
    );
    
    return [...childIds, ...grandChildrenIds];
  };

  // Check if an entity is a child of the selected entity
  const isChildOfSelectedEntity = (entityId: string | undefined): boolean => {
    if (!entityId || !selectedEntityId) return false;
    
    const allChildrenOfSelected = getAllChildrenIds(selectedEntityId);
    return allChildrenOfSelected.includes(entityId);
  };

  return (
    <OrganizationContext.Provider
      value={{
        selectedEntityId,
        selectedEntityName,
        setSelectedEntity,
        organization,
        organizationalUnits,
        loadOrganizationData,
        getEntityName,
        isEntitySelected,
        isChildOfSelectedEntity
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}; 