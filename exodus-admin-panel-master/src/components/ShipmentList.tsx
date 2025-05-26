import React from 'react';
import { Shipment } from '../types';
import { format } from 'date-fns';

interface ShipmentListProps {
  shipments: Shipment[];
  onShipmentSelect: (shipment: Shipment) => void;
  selectedShipment?: Shipment;
}

export const ShipmentList: React.FC<ShipmentListProps> = ({
  shipments,
  onShipmentSelect,
  selectedShipment,
}) => {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Shipments</h3>
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {shipments.map((shipment) => (
            <li
              key={shipment.id}
              className={`px-4 py-4 hover:bg-gray-50 cursor-pointer ${
                selectedShipment?.id === shipment.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => onShipmentSelect(shipment)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {shipment.trackingNumber}
                    </p>
                    <p className="text-sm text-gray-500">
                      {shipment.origin.city}, {shipment.origin.state} → {shipment.destination.city}, {shipment.destination.state}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      shipment.status === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : shipment.status === 'in_transit'
                        ? 'bg-blue-100 text-blue-800'
                        : shipment.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {shipment.status.replace('_', ' ')}
                  </span>
                  <span className="ml-4 text-sm text-gray-500">
                    {format(new Date(shipment.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}; 