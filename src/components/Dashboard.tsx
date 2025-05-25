import React, { useState, useEffect } from 'react';
import { Map } from './Map';
import { 
  Shipment, 
  Quote, 
  LoadRequest, 
  Notification, 
  ServiceType,
  Carrier,
  User,
  ShipmentEvent,
  Document,
  Location,
  ShipmentItem
} from '../types';
import { 
  ChartBarIcon, 
  MapIcon, 
  ListBulletIcon,
  BellIcon,
  UserCircleIcon,
  PlusIcon,
  ArrowPathIcon,
  TruckIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  AdjustmentsHorizontalIcon,
  ArrowRightOnRectangleIcon,
  EnvelopeIcon,
  ClipboardDocumentListIcon,
  DocumentChartBarIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserGroupIcon,
  FunnelIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { NewShipmentForm } from './NewShipmentForm';
import { format, subDays, subWeeks, subMonths, isWithinInterval, parseISO } from 'date-fns';
import { ShipmentList } from './ShipmentList';

interface DashboardProps {
  loadRequests: LoadRequest[];
  shipments: Shipment[];
  carriers: Carrier[];
  quotes: Quote[];
  notifications: Notification[];
  currentUser: User;
  onRefresh?: () => void;
  onNotificationClick?: (notification: Notification) => void;
  onViewDetails?: (type: 'shipment' | 'carrier' | 'quote', id: string) => void;
  onExportData?: (type: 'shipments' | 'carriers' | 'quotes') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  loadRequests,
  shipments,
  carriers,
  quotes,
  notifications,
  currentUser,
  onRefresh,
  onNotificationClick,
  onViewDetails,
  onExportData,
}) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [expandedMetrics, setExpandedMetrics] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(notifications.filter(n => !n.read).length);
  const [showNewShipmentForm, setShowNewShipmentForm] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState<LoadRequest | null>(null);

  const filteredShipments = shipments.filter(shipment => {
    const shipmentDate = new Date(shipment.createdAt);
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '24h':
        startDate = subDays(now, 1);
        break;
      case '7d':
        startDate = subWeeks(now, 1);
        break;
      case '30d':
        startDate = subMonths(now, 1);
        break;
      default:
        startDate = subDays(now, 1);
    }

    return isWithinInterval(shipmentDate, { start: startDate, end: now });
  });

  // Calculate statistics
  const stats = {
    activeLoads: loadRequests.filter(load => load.status === 'in_transit').length,
    pendingQuotes: quotes.filter(quote => quote.status === 'pending').length,
    activeCarriers: carriers.filter(carrier => carrier.active).length,
    totalRevenue: quotes
      .filter(quote => quote.status === 'accepted')
      .reduce((sum, quote) => sum + quote.price, 0),
    onTimeDeliveries: shipments.filter(shipment => 
      shipment.status === 'delivered' && 
      parseISO(shipment.updatedAt) <= parseISO(shipment.deliveryDate)
    ).length,
    totalShipments: shipments.length,
    hazmatShipments: shipments.filter(shipment => 
      shipment.items.some(item => item.hazmat)
    ).length,
    refrigeratedShipments: shipments.filter(shipment => 
      shipment.serviceType === 'FTL'
    ).length,
    pendingDocuments: shipments.reduce((count, shipment) => 
      count + shipment.documents.filter(doc => doc.status === 'pending').length, 0
    ),
    activeUsers: carriers.reduce((count, carrier) => 
      count + carrier.contacts.length, 0
    ),
  };

  // Calculate service type distribution
  const serviceDistribution = filteredShipments.reduce((acc, shipment) => {
    acc[shipment.serviceType] = (acc[shipment.serviceType] || 0) + 1;
    return acc;
  }, {} as Record<ServiceType, number>);

  // Filter shipments based on search and service type
  const filteredRecentShipments = filteredShipments
    .filter(shipment => {
      const matchesSearch = 
        shipment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shipment.origin.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shipment.destination.city.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesService = selectedService === 'all' || shipment.serviceType === selectedService;
      
      return matchesSearch && matchesService;
    })
    .slice(0, 5);

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const toggleMetric = (metricId: string) => {
    setExpandedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    // Handle notification click
    console.log('Notification clicked:', notification);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleMapView = () => {
    if (selectedShipment) {
      const loadRequest: LoadRequest = {
        id: selectedShipment.id,
        origin: selectedShipment.origin,
        destination: selectedShipment.destination,
        status: selectedShipment.status,
        serviceType: selectedShipment.serviceType,
        equipmentType: selectedShipment.equipmentType,
        weight: selectedShipment.weight,
        items: selectedShipment.items,
        createdAt: selectedShipment.createdAt,
        updatedAt: selectedShipment.updatedAt,
        pickupDate: selectedShipment.pickupDate,
        deliveryDate: selectedShipment.deliveryDate,
        pricing: selectedShipment.pricing,
        emailNotifications: selectedShipment.emailNotifications,
      };
      setSelectedLoad(loadRequest);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    // Implement mark as read functionality
    console.log('Mark as read');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => setTimeRange('24h')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    timeRange === '24h' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  24h
                </button>
                <button
                  onClick={() => setTimeRange('7d')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    timeRange === '7d' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  7d
                </button>
                <button
                  onClick={() => setTimeRange('30d')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    timeRange === '30d' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  30d
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowNewShipmentForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                New Shipment
              </button>
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-400 hover:text-gray-500"
              >
                <ArrowPathIcon className="h-6 w-6" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-400 hover:text-gray-500 relative"
                >
                  <BellIcon className="h-6 w-6" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                        {unreadNotifications > 0 && (
                          <button
                            onClick={() => {
                              // Implement mark all as read functionality
                              console.log('Mark all as read');
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              {notification.type === 'success' && (
                                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                              )}
                              {notification.type === 'error' && (
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                              )}
                              {notification.type === 'info' && (
                                <InformationCircleIcon className="h-5 w-5 text-blue-400" />
                              )}
                            </div>
                            <div className="ml-3 w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.message}
                              </p>
                              <p className="mt-1 text-xs text-gray-400">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="ml-4 flex-shrink-0 text-sm text-blue-600 hover:text-blue-800"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => {
                    // Implement user menu functionality
                    console.log('User menu');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-500"
                >
                  <UserCircleIcon className="h-6 w-6" />
                </button>
                {/* Add user menu content here */}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="p-6 space-y-6">
          {/* Header with User Info and Notifications */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-semibold">Welcome back, {currentUser.name}</h2>
                <p className="text-sm text-gray-500">Here's what's happening with your shipments</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Quick Actions Menu */}
              <div className="relative group">
                <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Cog6ToothIcon className="h-5 w-5 mr-2" />
                  Quick Actions
                  <ChevronDownIcon className="h-4 w-4 ml-2" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 hidden group-hover:block z-20">
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    New Shipment
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                    <UserGroupIcon className="h-5 w-5 mr-2" />
                    Add Carrier
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                    Create Quote
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                    <ChartBarIcon className="h-5 w-5 mr-2" />
                    Generate Report
                  </button>
                </div>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                >
                  <BellIcon className="h-6 w-6" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                    <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="text-sm font-semibold">Notifications</h3>
                      <button className="text-xs text-blue-600 hover:text-blue-800">
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(notification => (
                          <button
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className="w-full px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-0"
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                {!notification.read && (
                                  <div className="h-2 w-2 bg-blue-600 rounded-full mt-2" />
                                )}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {format(parseISO(notification.createdAt), 'MMM d, h:mm a')}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500">No notifications</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserCircleIcon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium">{currentUser.name}</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 hidden group-hover:block z-20">
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                    <UserCircleIcon className="h-5 w-5 mr-2" />
                    Profile Settings
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 mr-2" />
                    Security
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                    <Cog6ToothIcon className="h-5 w-5 mr-2" />
                    Preferences
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center">
                    <XMarkIcon className="h-5 w-5 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                className={`p-2 text-gray-600 hover:text-gray-900 focus:outline-none ${isLoading ? 'animate-spin' : ''}`}
              >
                <ArrowPathIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex space-x-4 border-b border-gray-200 pb-4">
            <button className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
              Dashboard
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
              Shipments
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
              Carriers
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
              Quotes
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
              Reports
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
              Settings
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search shipments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <FunnelIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value as ServiceType | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Services</option>
                {['LTL', 'FTL', 'Refrigerated', 'Hazmat', 'Expedited', 'Intermodal'].map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                id: 'active-loads',
                title: 'Active Loads',
                value: stats.activeLoads,
                icon: TruckIcon,
                color: 'bg-blue-500',
                trend: '+12%',
                expanded: expandedMetrics.includes('active-loads'),
                details: [
                  { label: 'In Transit', value: stats.activeLoads },
                  { label: 'Scheduled', value: loadRequests.filter(load => load.status === 'scheduled').length },
                  { label: 'On Hold', value: loadRequests.filter(load => load.status === 'on_hold').length },
                ],
              },
              {
                id: 'revenue',
                title: 'Total Revenue',
                value: `$${stats.totalRevenue.toLocaleString()}`,
                icon: CurrencyDollarIcon,
                color: 'bg-green-500',
                trend: '+8%',
                expanded: expandedMetrics.includes('revenue'),
                details: [
                  { label: 'This Month', value: `$${stats.totalRevenue.toLocaleString()}` },
                  { label: 'Last Month', value: '$45,000' },
                  { label: 'YTD', value: '$180,000' },
                ],
              },
              {
                id: 'on-time',
                title: 'On-Time Delivery',
                value: `${Math.round((stats.onTimeDeliveries / stats.totalShipments) * 100)}%`,
                icon: CheckCircleIcon,
                color: 'bg-green-500',
                trend: '+5%',
                expanded: expandedMetrics.includes('on-time'),
                details: [
                  { label: 'On Time', value: stats.onTimeDeliveries },
                  { label: 'Delayed', value: stats.totalShipments - stats.onTimeDeliveries },
                  { label: 'Total', value: stats.totalShipments },
                ],
              },
              {
                id: 'active-carriers',
                title: 'Active Carriers',
                value: stats.activeCarriers,
                icon: UserGroupIcon,
                color: 'bg-purple-500',
                trend: '+3%',
                expanded: expandedMetrics.includes('active-carriers'),
                details: [
                  { label: 'Active', value: stats.activeCarriers },
                  { label: 'Total', value: carriers.length },
                  { label: 'New This Month', value: '5' },
                ],
              },
            ].map(stat => (
              <div
                key={stat.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                      <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className={`text-sm font-medium ${
                      stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trend}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">vs last period</span>
                  </div>
                </div>
                <div className="border-t border-gray-100">
                  <button
                    onClick={() => toggleMetric(stat.id)}
                    className="w-full px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span>View Details</span>
                    {stat.expanded ? (
                      <ChevronUpIcon className="h-5 w-5" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5" />
                    )}
                  </button>
                  {stat.expanded && (
                    <div className="px-6 pb-4 space-y-3">
                      {stat.details.map((detail, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{detail.label}</span>
                          <span className="text-sm font-medium text-gray-900">{detail.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Map/List View Toggle */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Active Shipments</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'map'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <MapPinIcon className="h-5 w-5 inline-block mr-2" />
                Map View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <DocumentTextIcon className="h-5 w-5 inline-block mr-2" />
                List View
              </button>
            </div>
          </div>

          {/* Map/List Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {viewMode === 'map' ? (
              <div className="h-[500px]">
                {selectedLoad && (
                  <Map loadRequest={selectedLoad} />
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredShipments
                  .filter(shipment => 
                    shipment.status === 'in_transit' &&
                    (searchQuery === '' || 
                      shipment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      shipment.origin.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      shipment.destination.city.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map(shipment => (
                    <div
                      key={shipment.id}
                      onClick={() => setSelectedShipment(shipment)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedShipment?.id === shipment.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${getStatusColor(shipment.status)}`}>
                            <TruckIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Shipment #{shipment.id}</h4>
                            <p className="text-sm text-gray-500">
                              {shipment.origin.city} → {shipment.destination.city}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">
                            {format(parseISO(shipment.pickupDate), 'MMM d')} - {format(parseISO(shipment.deliveryDate), 'MMM d')}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                            {shipment.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredShipments.slice(0, 5).map(shipment => (
                <div key={shipment.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${getStatusColor(shipment.status)}`}>
                        <TruckIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Shipment #{shipment.id}</h4>
                        <p className="text-sm text-gray-500">
                          {shipment.origin.city} → {shipment.destination.city}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        {format(parseISO(shipment.pickupDate), 'MMM d')} - {format(parseISO(shipment.deliveryDate), 'MMM d')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                        {shipment.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* New Shipment Modal */}
      {showNewShipmentForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">New Shipment</h2>
                <button
                  onClick={() => setShowNewShipmentForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <NewShipmentForm
                onSubmit={(shipment) => {
                  // Handle new shipment creation
                  console.log('New shipment:', shipment);
                  setShowNewShipmentForm(false);
                }}
                onCancel={() => setShowNewShipmentForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 