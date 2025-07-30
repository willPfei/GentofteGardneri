import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/modules/Vendors';
import Systems from './pages/modules/Systems';
import Activities from './pages/modules/Activities';
import OrganizationInfo from './pages/modules/OrganizationInfo';
import RiskAssessments from './pages/modules/RiskAssessments';
import PrivateRoute from './components/PrivateRoute';
import GenerateReports from './pages/GenerateReports';
import Article30Report from './pages/reports/Article30Report';
import UserManagement from './pages/modules/UserManagement';
import DataSubjectRequests from './pages/modules/DataSubjectRequests';
import DataBreachManagement from './pages/modules/DataBreachManagement';
import DataBreachDetail from './pages/modules/DataBreachDetail';
import ApiDebugger from './pages/modules/ApiDebugger';
import { OrganizationProvider } from './context/OrganizationContext';

const App: React.FC = () => {
  return (
    <OrganizationProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/modules/vendors" element={
              <PrivateRoute>
                <Vendors />
              </PrivateRoute>
            } />
            <Route path="/modules/systems" element={
              <PrivateRoute>
                <Systems />
              </PrivateRoute>
            } />
            <Route path="/modules/activities" element={
              <PrivateRoute>
                <Activities />
              </PrivateRoute>
            } />
            <Route path="/organization-info" element={<PrivateRoute><OrganizationInfo /></PrivateRoute>} />
            <Route path="/modules/risk-assessments" element={
              <PrivateRoute>
                <RiskAssessments />
              </PrivateRoute>
            } />
            <Route path="/modules/generate-reports" element={
              <PrivateRoute>
                <GenerateReports />
              </PrivateRoute>
            } />
            <Route path="/modules/user-management" element={<PrivateRoute><UserManagement /></PrivateRoute>} />
            <Route path="/modules/data-subjects-requests" element={<PrivateRoute><DataSubjectRequests /></PrivateRoute>} />
            <Route path="/modules/data-breach-management" element={
              <PrivateRoute>
                <DataBreachManagement />
              </PrivateRoute>
            } />
            <Route path="/modules/data-breach-detail/:id" element={
              <PrivateRoute>
                <DataBreachDetail />
              </PrivateRoute>
            } />
            <Route path="/modules/api-debugger" element={
              <PrivateRoute>
                <ApiDebugger />
              </PrivateRoute>
            } />
            <Route path="/reports/article30" element={
              <PrivateRoute>
                <Article30Report />
              </PrivateRoute>
            } />
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
      </Router>
    </OrganizationProvider>
  );
};

export default App;
