import React, { useState } from 'react';
import {
  ShieldCheckIcon,
  TruckIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { Shipment, ShipmentEvent } from '../types';

interface HighValueShipmentTrackerProps {
  shipments: Shipment[];
  onUpdateStatus: (shipmentId: string, status: Shipment['status']) => void;
  onAddEvent: (shipmentId: string, event: Omit<ShipmentEvent, 'id'>) => void;
}

export const HighValueShipmentTracker: React.FC<HighValueShipmentTrackerProps> = ({
  shipments,
  onUpdateStatus,
  onAddEvent,
}) => {
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  const highValueShipments = shipments.filter(shipment => 
    shipment.pricing.finalPrice >= 1000000 // $1M threshold
  );

  const getSecurityLevel = (shipment: Shipment) => {
    const value = shipment.pricing.finalPrice;
    if (value >= 10000000) return 'critical'; // $10M+
    if (value >= 5000000) return 'high'; // $5M+
    return 'medium'; // $1M+
  };

  const getSecurityIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <ShieldCheckIcon className="h-6 w-6 text-red-600" />;
      case 'high':
        return <ShieldCheckIcon className="h-6 w-6 text-orange-500" />;
      default:
        return <ShieldCheckIcon className="h-6 w-6 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">High-Value Shipment Tracker</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Total Value: ${highValueShipments.reduce((sum, s) => sum + s.pricing.finalPrice, 0).toLocaleString()}
            </span>
            <button
              onClick={() => setShowSecurityModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <ShieldCheckIcon className="h-5 w-5 mr-2" />
              Security Protocol
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shipment List */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Active High-Value Shipments</h3>
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
              {highValueShipments.map(shipment => {
                const securityLevel = getSecurityLevel(shipment);
                return (
                  <div
                    key={shipment.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedShipment(shipment)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          {getSecurityIcon(securityLevel)}
                          <p className="text-sm font-medium text-gray-900">
                            {shipment.trackingNumber}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {shipment.origin.city} → {shipment.destination.city}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ${shipment.pricing.finalPrice.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(shipment.pickupDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <TruckIcon className="h-4 w-4 mr-1" />
                        {shipment.carrier.name}
                      </span>
                      <span className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {format(new Date(shipment.deliveryDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipment Details */}
          {selectedShipment && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Shipment Details</h3>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Origin</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedShipment.origin.address}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedShipment.origin.city}, {selectedShipment.origin.state}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Destination</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedShipment.destination.address}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedShipment.destination.city}, {selectedShipment.destination.state}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-500">Security Measures</p>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center text-sm">
                      <ShieldCheckIcon className="h-5 w-5 text-green-500 mr-2" />
                      GPS Tracking Enabled
                    </div>
                    <div className="flex items-center text-sm">
                      <ShieldCheckIcon className="h-5 w-5 text-green-500 mr-2" />
                      Armed Security Escort
                    </div>
                    <div className="flex items-center text-sm">
                      <ShieldCheckIcon className="h-5 w-5 text-green-500 mr-2" />
                      Temperature Monitoring
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-500">Recent Events</p>
                  <div className="mt-2 space-y-2">
                    {selectedShipment.events?.map(event => (
                      <div key={event.id} className="flex items-start text-sm">
                        <MapPinIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">{event.description}</p>
                          <p className="text-gray-500">
                            {format(new Date(event.timestamp), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Protocol Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Security Protocol</h2>
                <button
                  onClick={() => setShowSecurityModal(false)}
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
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Critical Value Shipments ({'>'}$10M)</h3>
                  <ul className="mt-2 space-y-2 text-sm text-gray-500">
                    <li>• 24/7 GPS tracking with geofencing</li>
                    <li>• Armed security escort (2+ personnel)</li>
                    <li>• Temperature and humidity monitoring</li>
                    <li>• Real-time video surveillance</li>
                    <li>• Insurance coverage: $15M+</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">High Value Shipments ($5M-$10M)</h3>
                  <ul className="mt-2 space-y-2 text-sm text-gray-500">
                    <li>• GPS tracking with geofencing</li>
                    <li>• Armed security escort (1+ personnel)</li>
                    <li>• Temperature monitoring</li>
                    <li>• Insurance coverage: $10M+</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Medium Value Shipments ($1M-$5M)</h3>
                  <ul className="mt-2 space-y-2 text-sm text-gray-500">
                    <li>• GPS tracking</li>
                    <li>• Security escort</li>
                    <li>• Insurance coverage: $5M+</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 