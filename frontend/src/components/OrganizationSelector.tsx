import React, { useState, useEffect, useRef } from 'react';
import { useOrganization } from '../context/OrganizationContext';
import '../styles/organizationSelector.css';

const OrganizationSelector: React.FC = () => {
  const {
    selectedEntityId,
    selectedEntityName,
    setSelectedEntity,
    organization,
    organizationalUnits,
    loadOrganizationData
  } = useOrganization();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load organization data when component mounts
    loadOrganizationData();
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [loadOrganizationData]);

  // Get all top-level subsidiaries (units with no parent)
  const getTopLevelSubsidiaries = () => {
    return organizationalUnits.filter(unit => 
      unit.unit_type === 'SUBSIDIARY' && !unit.parent_unit_id
    );
  };
  
  // Get departments directly under the organization (not under any subsidiary)
  const getTopLevelDepartments = () => {
    return organizationalUnits.filter(unit => 
      unit.unit_type === 'DEPARTMENT' && !unit.parent_unit_id
    );
  };
  
  // Get child units of a specific parent
  const getChildUnits = (parentId: string) => {
    return organizationalUnits.filter(unit => unit.parent_unit_id === parentId);
  };

  const renderOrganizationalUnit = (unit: typeof organizationalUnits[0], level = 0) => {
    const childUnits = getChildUnits(unit.id);
    const isSelected = selectedEntityId === unit.id;
    
    return (
      <React.Fragment key={unit.id}>
        <div 
          className={`org-selector-item ${isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
          onClick={() => {
            setSelectedEntity(unit.id, unit.name);
            setIsDropdownOpen(false);
          }}
        >
          <span className="org-selector-icon">
            {unit.unit_type === 'SUBSIDIARY' ? '🏢' : '🔹'}
          </span>
          <span className="org-selector-name">{unit.name}</span>
        </div>
        {childUnits.map(childUnit => renderOrganizationalUnit(childUnit, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="org-selector-container" ref={dropdownRef}>
      <div 
        className="org-selector-button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <span className="org-selector-current-icon">🏢</span>
        <span className="org-selector-current-name">{selectedEntityName}</span>
        <span className="org-selector-arrow">{isDropdownOpen ? '▲' : '▼'}</span>
      </div>
      
      {isDropdownOpen && (
        <div className="org-selector-dropdown">
          <div 
            className={`org-selector-item ${!selectedEntityId ? 'selected' : ''}`}
            onClick={() => {
              setSelectedEntity(null, 'All Entities');
              setIsDropdownOpen(false);
            }}
          >
            <span className="org-selector-icon">🌐</span>
            <span className="org-selector-name">All Entities</span>
          </div>
          
          {organization && (
            <div 
              className={`org-selector-item ${selectedEntityId === organization.id ? 'selected' : ''}`}
              onClick={() => {
                setSelectedEntity(organization.id, organization.name);
                setIsDropdownOpen(false);
              }}
            >
              <span className="org-selector-icon">🏛️</span>
              <span className="org-selector-name">{organization.name}</span>
            </div>
          )}
          
          <div className="org-selector-separator"></div>
          
          {getTopLevelSubsidiaries().map(unit => renderOrganizationalUnit(unit))}
          {getTopLevelDepartments().map(unit => renderOrganizationalUnit(unit))}
          
          {organizationalUnits.length === 0 && (
            <div className="org-selector-empty">
              No organizational entities defined
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrganizationSelector; 