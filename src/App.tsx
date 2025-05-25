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

// Mock data for development
const mockCarrier: Carrier = {
  id: '1',
  name: 'Test Carrier',
  type: 'FTL',
  active: true,
  contacts: [],
  equipmentTypes: ['van', 'reefer', 'flatbed'],
};

const mockShipments: Shipment[] = [
  {
    id: '1',
    trackingNumber: 'TRK001',
    origin: {
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    destination: {
      address: '456 Market St',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA',
    },
    status: 'in_transit',
    carrier: mockCarrier,
    serviceType: 'FTL' as ServiceType,
    equipmentType: 'van' as EquipmentType,
    weight: 1000,
    items: [
      {
        id: '1',
        description: 'Electronics',
        quantity: 10,
        weight: 1000,
        volume: 5,
        dimensions: {
          length: 10,
          width: 10,
          height: 10,
        },
        hazmat: false,
        packagingType: 'pallets',
        commodity: 'Electronics',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pickupDate: new Date().toISOString(),
    deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    documents: [],
    pricing: {
      basePrice: 5000,
      markup: 0.15,
      finalPrice: 5750,
    },
    emailNotifications: {
      to: ['test@example.com'],
      sent: true,
      sentAt: new Date().toISOString(),
    },
  },
];

const mockQuotes: Quote[] = [
  {
    id: '1',
    shipmentId: '1',
    carrierId: '1',
    price: 5000,
    basePrice: 4000,
    markup: 0.15,
    currency: 'USD',
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    terms: 'Standard terms and conditions apply',
    createdAt: new Date().toISOString(),
    status: 'accepted',
    serviceType: 'FTL' as ServiceType,
    equipmentType: 'van' as EquipmentType,
  },
];

const mockNotifications: Notification[] = [
  {
    id: '1',
    message: 'New shipment created',
    type: 'info',
    read: false,
    createdAt: new Date().toISOString(),
  },
];

const mockUser: User = {
  id: '1',
  name: 'Admin User',
  email: 'admin@exoduslogistix.com',
  role: 'admin',
  company: 'Exodus Logistix',
  phone: '123-456-7890',
  createdAt: new Date().toISOString(),
};

const mockEmailLogs = [
  {
    id: '1',
    to: ['test@example.com'],
    subject: 'Shipment Update',
    status: 'sent' as const,
    createdAt: new Date().toISOString(),
    sentAt: new Date().toISOString(),
  },
];

const mockPricingConfig = {
  baseRates: {
    FTL: 2.5,
    LTL: 3.5,
    'Shared Truckload': 2.0,
  },
  markup: 0.15,
  fuelSurcharge: 0.1,
};

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <DashboardLayout>{children}</DashboardLayout> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  const handleUpdateStatus = (shipmentId: string, status: Shipment['status']) => {
    console.log('Update status:', shipmentId, status);
  };

  const handleAddEvent = (shipmentId: string, event: Omit<ShipmentEvent, 'id'>) => {
    console.log('Add event:', shipmentId, event);
  };

  const handleExportReport = (type: 'revenue' | 'profit' | 'all') => {
    console.log('Export report:', type);
  };

  const handleRetryEmail = (logId: string) => {
    console.log('Retry email:', logId);
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
