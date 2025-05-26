import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { HighValueShipmentTracker } from './components/HighValueShipmentTracker';
import { FinancialDashboard } from './components/FinancialDashboard';
import { EmailLogPanel } from './components/EmailLogPanel';
import { DashboardLayout } from './components/DashboardLayout';
import { Shipment, Quote, Carrier, ServiceType, EquipmentType, Notification, User, ShipmentEvent } from './types';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="/dashboard" element={<Dashboard 
                      loadRequests={[]}
                      shipments={[]}
                      carriers={[]}
                      quotes={[]}
                      notifications={[]}
                      currentUser={{
                        id: '1',
                        name: 'Admin User',
                        email: 'admin@example.com',
                        role: 'admin',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                      }}
                    />} />
                    <Route path="/shipments/high-value" element={<HighValueShipmentTracker />} />
                    <Route path="/financial" element={<FinancialDashboard />} />
                    <Route path="/email-logs" element={<EmailLogPanel />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
  };

  const handleTestEmail = () => {
    console.log('Send test email');
  };

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard
                  loadRequests={[]}
                  shipments={mockShipments}
                  carriers={[mockCarrier]}
                  quotes={mockQuotes}
                  notifications={mockNotifications}
                  currentUser={mockUser}
                  onRefresh={() => {}}
                  onNotificationClick={() => {}}
                  onViewDetails={() => {}}
                  onExportData={() => {}}
                />
              </PrivateRoute>
            }
          />
          <Route
            path="/shipments/high-value"
            element={
              <PrivateRoute>
                <HighValueShipmentTracker
                  shipments={mockShipments}
                  onUpdateStatus={handleUpdateStatus}
                  onAddEvent={handleAddEvent}
                />
              </PrivateRoute>
            }
          />
          <Route
            path="/financial/overview"
            element={
              <PrivateRoute>
                <FinancialDashboard
                  shipments={mockShipments}
                  quotes={mockQuotes}
                  onExportReport={handleExportReport}
                />
              </PrivateRoute>
            }
          />
          <Route
            path="/email-logs"
            element={
              <PrivateRoute>
                <EmailLogPanel
                  logs={mockEmailLogs}
                  onRetry={handleRetryEmail}
                  onTestEmail={handleTestEmail}
                />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
