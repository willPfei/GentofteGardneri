import { System } from '../pages/modules/Systems';
import { ProcessingActivity } from '../pages/modules/Activities';

export interface Certification {
  name: string;
  issueDate: string;
  expiryDate: string;
  certificationBody: string;
  scope: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactName: string;
  contactEmail: string;
  phone: string;
  address: string;
  description: string;
  dataProtectionOfficer: string;
  countryOfOperation: string;
  privacyPolicy: string;
  certifications: Certification[];
}

type CSVRow = {
  [key: string]: string | string[];
};

// Template headers for each module
export const CSV_TEMPLATES = {
  vendors: [
    'name',
    'contactName',
    'contactEmail',
    'phone',
    'address',
    'description',
    'dataProtectionOfficer',
    'countryOfOperation',
    'privacyPolicy',
    'certifications' // Will be semicolon-separated list of certification details
  ],
  systems: [
    'name',
    'description',
    'vendorId',
    'owner',
    'storageLocation',
    'securityMeasures',
    'contractDetails'
  ],
  activities: [
    'name',
    'description',
    'dataCategories',
    'dataSubjects',
    'legalBasis',
    'systemIds',
    'retentionPeriod',
    'recipients'
  ]
};

// Generate CSV content for templates
export const generateTemplateCSV = (type: 'vendors' | 'systems' | 'activities'): string => {
  const headers = CSV_TEMPLATES[type];
  return headers.join(',') + '\n';
};

// Parse raw CSV content into CSVRow[]
const parseRawCSV = (content: string): CSVRow[] => {
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  const results: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length !== headers.length) continue;

    const entry: CSVRow = {};
    headers.forEach((header, index) => {
      let value = values[index];
      
      // Handle array fields
      if (header === 'dataCategories' || header === 'dataSubjects' || header === 'systemIds') {
        entry[header] = value.split(';').map(v => v.trim()).filter(Boolean);
      } else {
        entry[header] = value;
      }
    });

    results.push(entry);
  }

  return results;
};

// Function overloads for parseCSV
export function parseCSV(content: string, type: 'vendors'): Vendor[];
export function parseCSV(content: string, type: 'systems'): System[];
export function parseCSV(content: string, type: 'activities'): ProcessingActivity[];
export function parseCSV(content: string, type: 'vendors' | 'systems' | 'activities'): Vendor[] | System[] | ProcessingActivity[] {
  const rawData = parseRawCSV(content);
  
  // Validate the raw data before transformation
  const errors = validateCSVData(rawData, type);
  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }

  switch (type) {
    case 'vendors':
      return rawData.map((row): Vendor => {
        const certifications = (row.certifications as string || '').split(';')
          .filter(cert => cert.trim())
          .map(cert => {
            const [name, issueDate, expiryDate, certificationBody, scope] = cert.split('|').map(s => s.trim());
            return {
              name,
              issueDate,
              expiryDate,
              certificationBody,
              scope
            };
          });

        return {
          id: `v${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          name: row.name as string,
          contactName: row.contactName as string,
          contactEmail: row.contactEmail as string,
          phone: row.phone as string,
          address: row.address as string,
          description: row.description as string,
          dataProtectionOfficer: row.dataProtectionOfficer as string,
          countryOfOperation: row.countryOfOperation as string,
          privacyPolicy: row.privacyPolicy as string,
          certifications
        };
      });

    case 'systems':
      return rawData.map((row): System => ({
        id: `s${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        name: row.name as string,
        description: row.description as string,
        vendorId: row.vendorId as string,
        owner: row.owner as string,
        storageLocation: row.storageLocation as string,
        securityMeasures: row.securityMeasures as string,
        contractDetails: row.contractDetails as string
      }));

    case 'activities':
      return rawData.map((row): ProcessingActivity => ({
        id: `a${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        name: row.name as string,
        description: row.description as string,
        dataCategories: row.dataCategories as string[],
        dataSubjects: row.dataSubjects as string[],
        legalBasis: row.legalBasis as string,
        systemIds: row.systemIds as string[],
        retentionPeriod: row.retentionPeriod as string,
        recipients: row.recipients as string
      }));
  }
}

// Download CSV template
export const downloadTemplate = (type: 'vendors' | 'systems' | 'activities') => {
  const csvContent = generateTemplateCSV(type);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${type}_template.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Validate CSV data
export const validateCSVData = (data: CSVRow[], type: 'vendors' | 'systems' | 'activities'): string[] => {
  const errors: string[] = [];
  const requiredFields = {
    vendors: ['name', 'contactName', 'contactEmail'],
    systems: ['name', 'description', 'owner'],
    activities: ['name', 'description', 'legalBasis', 'retentionPeriod']
  };

  data.forEach((item, index) => {
    requiredFields[type].forEach(field => {
      if (!item[field]) {
        errors.push(`Row ${index + 1}: Missing required field "${field}"`);
      }
    });

    // Additional validation for email in vendors
    if (type === 'vendors' && item.contactEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(item.contactEmail as string)) {
        errors.push(`Row ${index + 1}: Invalid email format for contactEmail`);
      }
    }
  });

  return errors;
}; 