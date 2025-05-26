import React, { useState } from 'react';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  CreditCardIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { format, subMonths, subWeeks } from 'date-fns';
import { Quote, Shipment } from '../types';

interface FinancialDashboardProps {
  quotes: Quote[];
  shipments: Shipment[];
  onExportReport: (type: 'revenue' | 'profit' | 'all') => void;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  quotes,
  shipments,
  onExportReport,
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'profit' | 'volume'>('revenue');

  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case '7d':
        return subWeeks(now, 1);
      case '30d':
        return subMonths(now, 1);
      case '90d':
        return subMonths(now, 3);
    }
  };

  const calculateMetrics = () => {
    const startDate = getDateRange();
    const now = new Date();

    const filteredQuotes = quotes.filter(quote => {
      const quoteDate = new Date(quote.createdAt);
      return quoteDate >= startDate && quoteDate <= now;
    });

    const filteredShipments = shipments.filter(shipment => {
      const shipmentDate = new Date(shipment.createdAt);
      return shipmentDate >= startDate && shipmentDate <= now;
    });

    const totalRevenue = filteredQuotes.reduce((sum, quote) => sum + quote.price, 0);
    const totalProfit = filteredQuotes.reduce((sum, quote) => 
      sum + (quote.price - quote.basePrice), 0
    );
    const totalVolume = filteredShipments.reduce((sum, shipment) => 
      sum + shipment.pricing.finalPrice, 0
    );

    const highValueTransactions = filteredQuotes.filter(quote => quote.price >= 1000000);
    const criticalValueTransactions = filteredQuotes.filter(quote => quote.price >= 10000000);

    return {
      totalRevenue,
      totalProfit,
      totalVolume,
      highValueTransactions,
      criticalValueTransactions,
      averageMarkup: totalProfit / totalRevenue * 100,
      transactionCount: filteredQuotes.length,
    };
  };

  const metrics = calculateMetrics();

  const getTrendIcon = (value: number) => {
    if (value > 0) {
      return <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />;
    }
    return <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Financial Dashboard</h2>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <button
              onClick={() => onExportReport('all')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              id: 'revenue',
              title: 'Total Revenue',
              value: `$${metrics.totalRevenue.toLocaleString()}`,
              icon: CurrencyDollarIcon,
              color: 'bg-green-500',
              trend: '+12%',
            },
            {
              id: 'profit',
              title: 'Total Profit',
              value: `$${metrics.totalProfit.toLocaleString()}`,
              icon: BanknotesIcon,
              color: 'bg-blue-500',
              trend: '+8%',
            },
            {
              id: 'volume',
              title: 'Transaction Volume',
              value: `$${metrics.totalVolume.toLocaleString()}`,
              icon: CreditCardIcon,
              color: 'bg-purple-500',
              trend: '+15%',
            },
            {
              id: 'markup',
              title: 'Average Markup',
              value: `${metrics.averageMarkup.toFixed(1)}%`,
              icon: BuildingOfficeIcon,
              color: 'bg-yellow-500',
              trend: '+5%',
            },
          ].map(stat => (
            <div
              key={stat.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
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
                {getTrendIcon(parseInt(stat.trend))}
                <span className={`text-sm font-medium ${
                  stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend}
                </span>
                <span className="text-sm text-gray-500 ml-2">vs last period</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* High-Value Transactions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">High-Value Transactions</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Critical Value (&gt;$10M)</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {metrics.criticalValueTransactions.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Value</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${metrics.criticalValueTransactions.reduce((sum, q) => sum + q.price, 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">High Value ($1M-$10M)</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {metrics.highValueTransactions.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Value</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${metrics.highValueTransactions.reduce((sum, q) => sum + q.price, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Total Transactions</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {metrics.transactionCount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Average Value</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${(metrics.totalRevenue / metrics.transactionCount).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Success Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {((metrics.transactionCount / quotes.length) * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Profit Margin</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {((metrics.totalProfit / metrics.totalRevenue) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
