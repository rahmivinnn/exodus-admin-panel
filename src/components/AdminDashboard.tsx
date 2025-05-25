import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  TruckIcon,
  Cog6ToothIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MapIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { format, subDays, subWeeks, subMonths } from 'date-fns';
import { Quote, Shipment, ServiceType, EquipmentType, PricingConfig } from '../types';

interface AdminDashboardProps {
  quotes: Quote[];
  shipments: Shipment[];
  pricingConfig: PricingConfig;
  onUpdatePricing: (config: PricingConfig) => void;
  onExportData: (type: 'quotes' | 'shipments') => void;
  onResendEmail: (quoteId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  quotes,
  shipments,
  pricingConfig,
  onUpdatePricing,
  onExportData,
  onResendEmail,
}) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [selectedService, setSelectedService] = useState<ServiceType | 'all'>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | 'all'>('all');
  const [expandedMetrics, setExpandedMetrics] = useState<string[]>([]);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);

  // Filter data based on time range
  const filteredQuotes = quotes.filter(quote => {
    const quoteDate = new Date(quote.createdAt);
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

    return quoteDate >= startDate && quoteDate <= now;
  });

  // Calculate statistics
  const stats = {
    totalQuotes: filteredQuotes.length,
    totalRevenue: filteredQuotes
      .filter(quote => quote.status === 'accepted')
      .reduce((sum, quote) => sum + quote.price, 0),
    averageMarkup: filteredQuotes
      .filter(quote => quote.status === 'accepted')
      .reduce((sum, quote) => sum + (quote.markup / quote.basePrice * 100), 0) / 
      filteredQuotes.filter(quote => quote.status === 'accepted').length || 0,
    topRoutes: calculateTopRoutes(filteredQuotes),
    topEquipment: calculateTopEquipment(filteredQuotes),
  };

  function calculateTopRoutes(quotes: Quote[]) {
    const routes = quotes.reduce((acc, quote) => {
      const shipment = shipments.find(s => s.id === quote.shipmentId);
      if (shipment) {
        const route = `${shipment.origin.city} → ${shipment.destination.city}`;
        acc[route] = (acc[route] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(routes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([route, count]) => ({ route, count }));
  }

  function calculateTopEquipment(quotes: Quote[]) {
    const equipment = quotes.reduce((acc, quote) => {
      acc[quote.equipmentType] = (acc[quote.equipmentType] || 0) + 1;
      return acc;
    }, {} as Record<EquipmentType, number>);

    return Object.entries(equipment)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type, count]) => ({ type, count }));
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowPricingModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Cog6ToothIcon className="h-5 w-5 mr-2" />
                Pricing Settings
              </button>
              <button
                onClick={() => setShowServiceModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                Service Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time Range Selector */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setTimeRange('24h')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                timeRange === '24h' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Last 24 Hours
            </button>
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                timeRange === '7d' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                timeRange === '30d' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Last 30 Days
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              id: 'quotes',
              title: 'Total Quotes',
              value: stats.totalQuotes,
              icon: DocumentTextIcon,
              color: 'bg-blue-500',
              trend: '+12%',
              expanded: expandedMetrics.includes('quotes'),
              details: [
                { label: 'Accepted', value: quotes.filter(q => q.status === 'accepted').length },
                { label: 'Pending', value: quotes.filter(q => q.status === 'pending').length },
                { label: 'Rejected', value: quotes.filter(q => q.status === 'rejected').length },
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
                { label: 'Average Markup', value: `${stats.averageMarkup.toFixed(1)}%` },
                { label: 'Per Quote', value: `$${(stats.totalRevenue / stats.totalQuotes).toFixed(2)}` },
              ],
            },
            {
              id: 'routes',
              title: 'Top Routes',
              icon: MapIcon,
              color: 'bg-purple-500',
              expanded: expandedMetrics.includes('routes'),
              details: stats.topRoutes.map(route => ({
                label: route.route,
                value: `${route.count} quotes`,
              })),
            },
            {
              id: 'equipment',
              title: 'Top Equipment',
              icon: TruckIcon,
              color: 'bg-yellow-500',
              expanded: expandedMetrics.includes('equipment'),
              details: stats.topEquipment.map(eq => ({
                label: eq.type,
                value: `${eq.count} uses`,
              })),
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
                    {stat.value && (
                      <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
                    )}
                  </div>
                  <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                    <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                  </div>
                </div>
                {stat.trend && (
                  <div className="mt-4 flex items-center">
                    <span className={`text-sm font-medium ${
                      stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trend}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">vs last period</span>
                  </div>
                )}
              </div>
              <div className="border-t border-gray-100">
                <button
                  onClick={() => setExpandedMetrics(prev => 
                    prev.includes(stat.id) 
                      ? prev.filter(id => id !== stat.id)
                      : [...prev, stat.id]
                  )}
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

        {/* Quotes Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Quotes</h2>
              <div className="flex space-x-4">
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value as ServiceType | 'all')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Services</option>
                  <option value="FTL">FTL</option>
                  <option value="LTL">LTL</option>
                  <option value="Shared Truckload">Shared Truckload</option>
                </select>
                <select
                  value={selectedEquipment}
                  onChange={(e) => setSelectedEquipment(e.target.value as EquipmentType | 'all')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Equipment</option>
                  <option value="van">Van</option>
                  <option value="reefer">Reefer</option>
                  <option value="flatbed">Flatbed</option>
                </select>
                <button
                  onClick={() => onExportData('quotes')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Export
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quote ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotes
                  .filter(quote => 
                    (selectedService === 'all' || quote.serviceType === selectedService) &&
                    (selectedEquipment === 'all' || quote.equipmentType === selectedEquipment)
                  )
                  .map(quote => {
                    const shipment = shipments.find(s => s.id === quote.shipmentId);
                    return (
                      <tr key={quote.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {quote.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {shipment ? `${shipment.origin.city} → ${shipment.destination.city}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {quote.serviceType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {quote.equipmentType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${quote.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            quote.status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : quote.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {quote.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => onResendEmail(quote.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Resend Email
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Pricing Settings Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Pricing Settings</h2>
                <button
                  onClick={() => setShowPricingModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <form onSubmit={(e) => {
                e.preventDefault();
                // Handle pricing config update
                setShowPricingModal(false);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      GreenScreens API Key
                    </label>
                    <input
                      type="password"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter API key"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Default Markup Percentage
                    </label>
                    <input
                      type="number"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="15"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Minimum Markup
                    </label>
                    <input
                      type="number"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="10"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Maximum Markup
                    </label>
                    <input
                      type="number"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="25"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowPricingModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Service Settings Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Service Settings</h2>
                <button
                  onClick={() => setShowServiceModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <form onSubmit={(e) => {
                e.preventDefault();
                // Handle service settings update
                setShowServiceModal(false);
              }}>
                <div className="space-y-6">
                  {/* Service Types */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Service Types</h3>
                    <div className="mt-4 space-y-4">
                      {['FTL', 'LTL', 'Shared Truckload'].map((service) => (
                        <div key={service} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`service-${service}`}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`service-${service}`} className="ml-3 text-sm text-gray-700">
                            {service}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Equipment Types */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Equipment Types</h3>
                    <div className="mt-4 space-y-4">
                      {['van', 'reefer', 'flatbed'].map((equipment) => (
                        <div key={equipment} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`equipment-${equipment}`}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`equipment-${equipment}`} className="ml-3 text-sm text-gray-700">
                            {equipment.charAt(0).toUpperCase() + equipment.slice(1)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shared Truckload Limits */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Shared Truckload Limits</h3>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Max Pallets
                        </label>
                        <input
                          type="number"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="18"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Max Weight (lbs)
                        </label>
                        <input
                          type="number"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="30000"
                          min="1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowServiceModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 