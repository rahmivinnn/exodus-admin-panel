import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  DocumentTextIcon,
  MapIcon,
  BellIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

interface MenuItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: MenuItem[];
  badge?: number;
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: HomeIcon,
    badge: 5, // New notifications
  },
  {
    name: 'Shipments',
    path: '/shipments',
    icon: TruckIcon,
    badge: 3, // Pending shipments
    subItems: [
      { name: 'All Shipments', path: '/shipments/all', icon: TruckIcon },
      { name: 'High Value', path: '/shipments/high-value', icon: ShieldCheckIcon, badge: 2 },
      { name: 'Map View', path: '/shipments/map', icon: MapIcon },
    ],
  },
  {
    name: 'Financial',
    path: '/financial',
    icon: CurrencyDollarIcon,
    badge: 1, // New transactions
    subItems: [
      { name: 'Overview', path: '/financial/overview', icon: ChartBarIcon },
      { name: 'High Value', path: '/financial/high-value', icon: CurrencyDollarIcon },
      { name: 'Reports', path: '/financial/reports', icon: DocumentTextIcon },
    ],
  },
  {
    name: 'Carriers',
    path: '/carriers',
    icon: UserGroupIcon,
    badge: 2, // New carrier requests
  },
  {
    name: 'Email Logs',
    path: '/email-logs',
    icon: EnvelopeIcon,
    badge: 4, // Failed emails
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: Cog6ToothIcon,
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New high-value shipment created', type: 'alert', time: '2m ago' },
    { id: 2, message: 'Carrier status updated', type: 'info', time: '5m ago' },
    { id: 3, message: 'Payment received for shipment #1234', type: 'success', time: '10m ago' },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update notification times
      setNotifications(prev =>
        prev.map(notif => ({
          ...notif,
          time: notif.time.replace(/\d+m/, m => `${parseInt(m) + 1}m`),
        }))
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const toggleSubMenu = (path: string) => {
    setExpandedMenus(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const isSubMenuExpanded = (path: string) => {
    return expandedMenus.includes(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <img
            src="/logo.png"
            alt="Exodus Logistix"
            className="h-8 w-auto"
          />
        </div>

        {/* User Profile */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center">
            <UserCircleIcon className="h-8 w-8 text-gray-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <div key={item.path}>
                <button
                  onClick={() => item.subItems && toggleSubMenu(item.path)}
                  className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive(item.path) ? 'text-blue-500' : 'text-gray-400'
                    }`}
                  />
                  {item.name}
                  {item.badge && (
                    <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {item.badge}
                    </span>
                  )}
                  {item.subItems && (
                    <svg
                      className={`ml-auto h-5 w-5 transform ${
                        isSubMenuExpanded(item.path) ? 'rotate-180' : ''
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>

                {/* Submenu */}
                {item.subItems && isSubMenuExpanded(item.path) && (
                  <div className="mt-1 ml-4 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          isActive(subItem.path)
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <subItem.icon
                          className={`mr-3 h-5 w-5 ${
                            isActive(subItem.path) ? 'text-blue-500' : 'text-gray-400'
                          }`}
                        />
                        {subItem.name}
                        {subItem.badge && (
                          <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {subItem.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        {/* Top Navigation */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <h1 className="text-2xl font-semibold text-gray-900 my-auto">
                  {menuItems.find(item => isActive(item.path))?.name || 'Dashboard'}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <BellIcon className="h-6 w-6" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                  </button>
                  {showNotifications && (
                    <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                          >
                            <p className="text-sm text-gray-700">{notification.message}</p>
                            <p className="text-xs text-gray-500">{notification.time}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                  >
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                    <span className="text-sm font-medium">{user?.name}</span>
                  </button>
                  {showUserMenu && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <button
                          onClick={() => navigate('/settings')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Settings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}; 