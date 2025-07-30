import React, { useState } from 'react';
import { dataBreachApi, DataBreach } from '../../utils/apiService';

const ApiDebugger: React.FC = () => {
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const testDataBreachApi = async () => {
    setLoading(true);
    setError(null);
    setApiResponse(null);
    const startTime = Date.now();
    
    try {
      // Call the API directly
      console.log('Testing data breach API...');
      const result = await dataBreachApi.getAllBreaches();
      const endTime = Date.now();
      setResponseTime(endTime - startTime);
      
      setApiResponse(result);
      console.log('API test result:', result);
    } catch (err) {
      console.error('API test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      const endTime = Date.now();
      setResponseTime(endTime - startTime);
    } finally {
      setLoading(false);
    }
  };

  const testDirectFetch = async () => {
    setLoading(true);
    setError(null);
    setApiResponse(null);
    const startTime = Date.now();
    
    try {
      // Direct fetch without using our API service
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      console.log('Testing direct fetch to:', `${API_URL}/data-breaches`);
      
      const response = await fetch(`${API_URL}/data-breaches`);
      const endTime = Date.now();
      setResponseTime(endTime - startTime);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setApiResponse(data);
      console.log('Direct fetch result:', data);
    } catch (err) {
      console.error('Direct fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      const endTime = Date.now();
      setResponseTime(endTime - startTime);
    } finally {
      setLoading(false);
    }
  };

  const testMockData = () => {
    setLoading(true);
    setError(null);
    setApiResponse(null);
    
    // Simulate API delay
    setTimeout(() => {
      // Create mock data that matches the DataBreach interface
      const mockData: DataBreach[] = [
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
          severity: 'medium' as 'medium',
          breach_type: 'integrity' as 'integrity',
          status: 'contained' as 'contained',
          notify_authorities: false,
          notify_data_subjects: false,
          created_at: '2023-02-12T14:15:00Z',
          updated_at: '2023-02-15T09:45:00Z'
        }
      ];
      
      setApiResponse(mockData);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">API Debugger</h1>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            This tool helps debug API connection issues by testing different methods of retrieving data.
          </p>
          
          <div className="flex flex-wrap gap-4 mb-4">
            <button
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              onClick={testDataBreachApi}
              disabled={loading}
            >
              Test API Service
            </button>
            
            <button
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
              onClick={testDirectFetch}
              disabled={loading}
            >
              Test Direct Fetch
            </button>
            
            <button
              className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
              onClick={testMockData}
              disabled={loading}
            >
              Test Mock Data
            </button>
          </div>
          
          {loading && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Testing API...</span>
            </div>
          )}
          
          {responseTime !== null && (
            <p className="text-gray-600 mb-2">
              Response time: <span className="font-medium">{responseTime}ms</span>
            </p>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <h3 className="text-red-600 font-medium mb-2">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>
        
        {apiResponse && (
          <div>
            <h2 className="text-xl font-semibold mb-2">API Response</h2>
            <div className="p-4 bg-gray-50 rounded border overflow-auto max-h-96">
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Environment Information</h2>
          <div className="bg-gray-50 p-4 rounded border">
            <p><strong>API URL:</strong> {process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}</p>
            <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDebugger; 