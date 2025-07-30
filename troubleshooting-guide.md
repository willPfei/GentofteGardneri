# Data Breach Management Module - Troubleshooting Guide

## Issue: "Loading data breaches..." message displayed indefinitely

We've implemented several improvements and debugging tools to help resolve this issue:

### Fixes and Improvements:

1. **Server Port Change**: Modified the server to use port 3001 (changed from 3000) to match the expected API URL in the frontend code.

2. **Error Handling**: Enhanced error handling in the `fetchDataBreaches` function to properly handle different response types and ensure the loading state is always turned off.

3. **Debug Information**: Added debugging information to the component that shows:
   - Current loading state
   - Any error messages
   - Number of data breaches retrieved
   - Filter settings

4. **API Debugger Tool**: Created a dedicated API debugging tool accessible at `/modules/api-debugger` that can:
   - Test the API service directly
   - Test a direct fetch request to the API endpoint
   - Test with mock data to bypass API issues

### Troubleshooting Steps:

1. **Check Server Status**:
   - Ensure the server is running on port 3001: `cd /Users/nicholaipfeiffer/RoPA_WLC && node server.js`
   - If you see "Server is running on port 3001" in the console, the server is running correctly.

2. **Verify API Connectivity**:
   - Navigate to `/modules/api-debugger` in your application
   - Click "Test API Service" to see if the API service can retrieve data
   - Click "Test Direct Fetch" to bypass the API service and test the endpoint directly
   - Click "Test Mock Data" to see if the component works with mock data

3. **Check Browser Console for Errors**:
   - Open your browser's developer tools (F12 or Right-click > Inspect)
   - Go to the Console tab
   - Look for any error messages or the API logs we added
   - The logs should show:
     - "API Call: Getting all data breaches"
     - "API URL: [URL] Params: [params]"
     - "API Response: [data]" or error details

4. **Development Mode Debugging**:
   - Run the application in development mode with:
     ```
     cd /Users/nicholaipfeiffer/RoPA_WLC/frontend && REACT_APP_API_URL=http://localhost:3001/api npm start
     ```
   - Open the app (usually at http://localhost:3000)
   - Navigate to Data Breach Management
   - You should see the added debug section with state information

### Common Issues and Solutions:

1. **API Connection Issues**:
   - If "Test Direct Fetch" fails in the API Debugger, the server might not be responding correctly
   - Check if the server is running and accessible at http://localhost:3001

2. **Data Format Issues**:
   - If "Test API Service" works but shows unexpected data, there might be a mismatch between expected and actual data formats
   - Check the structure of the data returned from the API

3. **Component Rendering Issues**:
   - If "Test Mock Data" works but the actual component doesn't, there might be an issue with how the component processes the data
   - Check the component's filtering or rendering logic

4. **Fallback to Mock Data**:
   - If you need to quickly get the application working, add the following to the `fetchDataBreaches` function to use mock data:
   ```typescript
   // Add this right after the try/catch block
   if (dataBreaches.length === 0) {
     console.log("Using mock data as fallback");
     const mockBreaches = [
       {
         id: 'db123456',
         title: 'Demo Data Breach',
         breach_date: '2023-01-15',
         detection_date: '2023-01-20',
         reported_by: 'System Admin',
         severity: 'high',
         breach_type: 'confidentiality',
         status: 'assessed',
         notify_authorities: true,
         notify_data_subjects: false
       },
       {
         id: 'db789012',
         title: 'Test Security Incident',
         breach_date: '2023-02-10',
         detection_date: '2023-02-12',
         reported_by: 'Security Team',
         severity: 'medium',
         breach_type: 'integrity',
         status: 'contained',
         notify_authorities: false,
         notify_data_subjects: false
       }
     ];
     setDataBreaches(mockBreaches);
     setFilteredBreaches(mockBreaches);
   }
   ```

By following these steps, you should be able to identify and resolve the issue with the Data Breach Management module. 