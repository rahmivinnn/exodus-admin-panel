import React, { useState } from 'react';
import {
  TruckIcon,
  MapIcon,
  ChartBarIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Shipment, Location } from '../types';

interface Route {
  id: string;
  shipments: Shipment[];
  totalDistance: number;
  totalWeight: number;
  savings: number;
  estimatedTime: number;
}

interface SharedTruckloadOptimizerProps {
  shipments: Shipment[];
  onOptimize: (routes: Route[]) => void;
  onSaveRoute: (route: Route) => void;
}

export const SharedTruckloadOptimizer: React.FC<SharedTruckloadOptimizerProps> = ({
  shipments,
  onOptimize,
  onSaveRoute,
}) => {
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [optimizedRoutes, setOptimizedRoutes] = useState<Route[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleShipmentSelect = (shipmentId: string) => {
    setSelectedShipments(prev =>
      prev.includes(shipmentId)
        ? prev.filter(id => id !== shipmentId)
        : [...prev, shipmentId]
    );
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      // In a real implementation, this would call an API to optimize routes
      const selectedShipmentsData = shipments.filter(s => 
        selectedShipments.includes(s.id)
      );
      
      // Mock optimization logic
      const routes: Route[] = [{
        id: 'route-1',
        shipments: selectedShipmentsData,
        totalDistance: 500, // Mock values
        totalWeight: 2000,
        savings: 1500,
        estimatedTime: 8,
      }];
      
      setOptimizedRoutes(routes);
      onOptimize(routes);
    } catch (error) {
      console.error('Failed to optimize routes:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const calculateRouteStats = (route: Route) => {
    const totalVolume = route.shipments.reduce((sum, shipment) => 
      sum + (shipment.items?.reduce((itemSum, item) => 
        itemSum + (item.volume || 0), 0) || 0), 0
    );

    return {
      totalVolume,
      averageWeight: route.totalWeight / route.shipments.length,
      utilization: (totalVolume / 100) * 100, // Assuming 100 is max volume
    };
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Shared Truckload Optimizer</h2>
          <button
            onClick={handleOptimize}
            disabled={selectedShipments.length < 2 || isOptimizing}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isOptimizing ? (
              <>
                <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                Optimizing...
              </>
            ) : (
              <>
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Optimize Routes
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Available Shipments</h3>
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
              {shipments.map(shipment => (
                <div
                  key={shipment.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleShipmentSelect(shipment.id)}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedShipments.includes(shipment.id)}
                      onChange={() => {}}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {shipment.origin.city} → {shipment.destination.city}
                      </p>
                      <p className="text-sm text-gray-500">
                        Weight: {shipment.items?.reduce((sum, item) => sum + (item.weight || 0), 0)} kg
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Optimized Routes</h3>
            {optimizedRoutes.map(route => {
              const stats = calculateRouteStats(route);
              return (
                <div key={route.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Route {route.id}</h4>
                      <p className="text-sm text-gray-500">
                        {route.shipments.length} shipments
                      </p>
                    </div>
                    <button
                      onClick={() => onSaveRoute(route)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Save Route
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Distance</p>
                      <p className="text-sm font-medium text-gray-900">{route.totalDistance} km</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Weight</p>
                      <p className="text-sm font-medium text-gray-900">{route.totalWeight} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Estimated Time</p>
                      <p className="text-sm font-medium text-gray-900">{route.estimatedTime} hours</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Potential Savings</p>
                      <p className="text-sm font-medium text-green-600">${route.savings}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Route Utilization</p>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${stats.utilization}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats.utilization.toFixed(1)}% utilized
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}; 