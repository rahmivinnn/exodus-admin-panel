import React, { useState, useEffect } from 'react';
import {
  TruckIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  BellIcon,
  ChartPieIcon,
  MapPinIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserCircleIcon,
  CogIcon,
  ShieldCheckIcon,
  DocumentCheckIcon,
  TruckIcon as TruckSolidIcon,
} from '@heroicons/react/24/outline';
import { Map } from './Map';
import { LoadRequest, Shipment, Carrier, Quote, ServiceType, Notification, ShipmentEvent, User, Document } from '../types';
import { format, subDays, subWeeks, subMonths, isWithinInterval, parseISO } from 'date-fns';

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
  const [selectedTimeRange, setSelectedTimeRange] = useState<'day' | 'week' | 'month'>('day');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedView, setSelectedView] = useState<'map' | 'list'>('map');
  const [expandedMetrics, setExpandedMetrics] = useState<string[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'shipments' | 'carriers' | 'quotes'>('overview');

  // Filter data based on time range
  const getFilteredData = () => {
    const now = new Date();
    let startDate: Date;

    switch (selectedTimeRange) {
      case 'day':
        startDate = subDays(now, 1);
        break;
      case 'week':
        startDate = subWeeks(now, 1);
        break;
      case 'month':
        startDate = subMonths(now, 1);
        break;
      default:
        startDate = subDays(now, 1);
    }

    const timeFilter = (date: string) => 
      isWithinInterval(parseISO(date), { start: startDate, end: now });

    return {
      loadRequests: loadRequests.filter(load => timeFilter(load.createdAt)),
      shipments: shipments.filter(shipment => timeFilter(shipment.createdAt)),
      quotes: quotes.filter(quote => timeFilter(quote.createdAt)),
    };
  };

  const { loadRequests: filteredLoads, shipments: filteredShipments, quotes: filteredQuotes } = getFilteredData();

  // Calculate statistics
  const stats = {
    activeLoads: filteredLoads.filter(load => load.status === 'in_transit').length,
    pendingQuotes: filteredQuotes.filter(quote => quote.status === 'pending').length,
    activeCarriers: carriers.filter(carrier => carrier.active).length,
    totalRevenue: filteredQuotes
      .filter(quote => quote.status === 'accepted')
      .reduce((sum, quote) => sum + quote.price, 0),
    onTimeDeliveries: filteredShipments.filter(shipment => 
      shipment.status === 'delivered' && 
      parseISO(shipment.updatedAt) <= parseISO(shipment.deliveryDate)
    ).length,
    totalShipments: filteredShipments.length,
    hazmatShipments: filteredShipments.filter(shipment => 
      shipment.items.some(item => item.hazmat)
    ).length,
    refrigeratedShipments: filteredShipments.filter(shipment => 
      shipment.serviceType === 'Refrigerated'
    ).length,
    pendingDocuments: filteredShipments.reduce((count, shipment) => 
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

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsLoading(true);
      await onRefresh();
      setIsLoading(false);
    }
  };

  const toggleMetricExpansion = (metricId: string) => {
    setExpandedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <div className="p-6">
      {/* Header with User Info and Actions */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {currentUser.name} ({currentUser.role})
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-600 hover:text-gray-900 relative"
            >
              <BellIcon className="h-6 w-6" />
              {unreadNotifications.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadNotifications.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="font-semibold">Notifications</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    Mark all as read
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      onClick={() => onNotificationClick?.(notification)}
                      className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-1">
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(parseISO(notification.createdAt), 'MMM d, h:mm a')}
                          </p>
                        </div>
                        {notification.priority === 'high' && (
                          <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            High Priority
                          </span>
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
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Export
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
                <div className="py-1">
                  <button
                    onClick={() => onExportData?.('shipments')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export Shipments
                  </button>
                  <button
                    onClick={() => onExportData?.('carriers')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export Carriers
                  </button>
                  <button
                    onClick={() => onExportData?.('quotes')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export Quotes
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 border-b">
        <nav className="flex space-x-8">
          {(['overview', 'shipments', 'carriers', 'quotes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex space-x-2">
          {(['day', 'week', 'month'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedTimeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-600">
            <CalendarIcon className="h-5 w-5 mr-2" />
            {format(new Date(), 'MMMM d, yyyy')}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <UserCircleIcon className="h-5 w-5 mr-2" />
            {currentUser.role}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Loads"
          value={stats.activeLoads}
          icon={<TruckIcon className="h-6 w-6" />}
          trend={+5}
        />
        <StatCard
          title="Pending Quotes"
          value={stats.pendingQuotes}
          icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
          trend={-2}
        />
        <StatCard
          title="Active Carriers"
          value={stats.activeCarriers}
          icon={<UserGroupIcon className="h-6 w-6" />}
          trend={+3}
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          trend={+12}
          isMonetary
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map/List View Toggle */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Active Shipments</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedView('map')}
                className={`p-2 rounded-lg ${
                  selectedView === 'map'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <MapPinIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setSelectedView('list')}
                className={`p-2 rounded-lg ${
                  selectedView === 'list'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <DocumentTextIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          {selectedView === 'map' ? (
            <div className="h-[400px]">
              <Map
                loadRequest={selectedShipment || filteredLoads.find(load => load.status === 'in_transit')}
                className="h-full"
              />
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {filteredShipments
                .filter(shipment => shipment.status === 'in_transit')
                .map(shipment => (
                  <div
                    key={shipment.id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => onViewDetails?.('shipment', shipment.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{shipment.trackingNumber}</p>
                        <p className="text-sm text-gray-600">
                          {shipment.origin.city} → {shipment.destination.city}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Service: {shipment.serviceType}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mb-2">
                          In Transit
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(parseISO(shipment.pickupDate), 'MMM d')} - {format(parseISO(shipment.deliveryDate), 'MMM d')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Performance Metrics</h2>
          <div className="space-y-4">
            <MetricCard
              title="On-Time Delivery Rate"
              value={`${((stats.onTimeDeliveries / stats.totalShipments) * 100).toFixed(1)}%`}
              icon={<ClockIcon className="h-5 w-5" />}
              expanded={expandedMetrics.includes('onTime')}
              onToggle={() => toggleMetricExpansion('onTime')}
              details={
                <div className="mt-2 text-sm text-gray-600">
                  <p>Total Deliveries: {stats.totalShipments}</p>
                  <p>On-Time Deliveries: {stats.onTimeDeliveries}</p>
                  <p>Late Deliveries: {stats.totalShipments - stats.onTimeDeliveries}</p>
                </div>
              }
            />
            <MetricCard
              title="Hazmat Shipments"
              value={stats.hazmatShipments}
              icon={<ExclamationTriangleIcon className="h-5 w-5" />}
              expanded={expandedMetrics.includes('hazmat')}
              onToggle={() => toggleMetricExpansion('hazmat')}
              details={
                <div className="mt-2 text-sm text-gray-600">
                  <p>Percentage: {((stats.hazmatShipments / stats.totalShipments) * 100).toFixed(1)}%</p>
                  <p>Total Shipments: {stats.totalShipments}</p>
                </div>
              }
            />
            <MetricCard
              title="Refrigerated Shipments"
              value={stats.refrigeratedShipments}
              icon={<ChartBarIcon className="h-5 w-5" />}
              expanded={expandedMetrics.includes('refrigerated')}
              onToggle={() => toggleMetricExpansion('refrigerated')}
              details={
                <div className="mt-2 text-sm text-gray-600">
                  <p>Percentage: {((stats.refrigeratedShipments / stats.totalShipments) * 100).toFixed(1)}%</p>
                  <p>Total Shipments: {stats.totalShipments}</p>
                </div>
              }
            />
            <MetricCard
              title="Pending Documents"
              value={stats.pendingDocuments}
              icon={<DocumentCheckIcon className="h-5 w-5" />}
              expanded={expandedMetrics.includes('documents')}
              onToggle={() => toggleMetricExpansion('documents')}
              details={
                <div className="mt-2 text-sm text-gray-600">
                  <p>Total Documents: {filteredShipments.reduce((count, shipment) => 
                    count + shipment.documents.length, 0
                  )}</p>
                  <p>Approved: {filteredShipments.reduce((count, shipment) => 
                    count + shipment.documents.filter(doc => doc.status === 'approved').length, 0
                  )}</p>
                </div>
              }
            />
          </div>
        </div>

        {/* Service Distribution */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Service Distribution</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800">
              View Details
            </button>
          </div>
          <div className="space-y-4">
            {Object.entries(serviceDistribution).map(([service, count]) => (
              <div key={service} className="flex items-center justify-between">
                <span className="text-gray-600">{service}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${(count / stats.totalShipments) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity with Search and Filter */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <div className="flex space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search shipments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value as ServiceType | 'all')}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Services</option>
                {Object.keys(serviceDistribution).map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-4">
            {filteredRecentShipments.map((shipment) => (
              <div
                key={shipment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => onViewDetails?.('shipment', shipment.id)}
              >
                <div>
                  <p className="font-medium">{shipment.trackingNumber}</p>
                  <p className="text-sm text-gray-500">
                    {shipment.origin.city} → {shipment.destination.city}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      shipment.status === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : shipment.status === 'in_transit'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {shipment.status}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {format(parseISO(shipment.updatedAt), 'MMM d, h:mm a')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: number;
  isMonetary?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  isMonetary = false,
}) => (
  <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
      <div className="p-3 bg-blue-50 rounded-lg">{icon}</div>
    </div>
    <div className="mt-4 flex items-center">
      <ArrowTrendingUpIcon
        className={`h-4 w-4 ${
          trend >= 0 ? 'text-green-500' : 'text-red-500 rotate-180'
        }`}
      />
      <span
        className={`text-sm font-medium ml-1 ${
          trend >= 0 ? 'text-green-500' : 'text-red-500'
        }`}
      >
        {Math.abs(trend)}% {isMonetary ? 'increase' : 'growth'}
      </span>
    </div>
  </div>
);

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  expanded?: boolean;
  onToggle?: () => void;
  details?: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  expanded = false,
  onToggle,
  details,
}) => (
  <div 
    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
    onClick={onToggle}
  >
    <div className="flex items-center">
      <div className="p-2 bg-blue-50 rounded-lg mr-3">{icon}</div>
      <div>
        <span className="text-gray-600">{title}</span>
        {expanded && details}
      </div>
    </div>
    <div className="flex items-center">
      <span className="text-lg font-semibold text-gray-900 mr-2">{value}</span>
      <ArrowTrendingUpIcon
        className={`h-4 w-4 transform transition-transform ${
          expanded ? 'rotate-180' : ''
        }`}
      />
    </div>
  </div>
); 