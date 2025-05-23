import React, { useState } from 'react';
import { Shipment, Location, ServiceType, EquipmentType } from '../types';

interface NewShipmentFormProps {
  onSubmit: (shipment: Partial<Shipment>) => void;
  onCancel: () => void;
}

export const NewShipmentForm: React.FC<NewShipmentFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    origin: {
      city: '',
      state: '',
      zipCode: '',
    } as Location,
    destination: {
      city: '',
      state: '',
      zipCode: '',
    } as Location,
    serviceType: 'FTL' as ServiceType,
    equipmentType: 'van' as EquipmentType,
    pickupDate: '',
    commodity: '',
    weight: '',
    packagingType: 'pallets' as const,
    items: [{
      description: '',
      quantity: 1,
      weight: 0,
      packagingType: 'pallets' as const,
      commodity: '',
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
      },
      hazmat: false,
    }],
  });

  const [greenscreenData, setGreenscreenData] = useState<{
    basePrice: number;
    distance: number;
    transitTime: number;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate pricing with 15% markup
    const basePrice = greenscreenData?.basePrice || 0;
    const markup = basePrice * 0.15;
    const finalPrice = basePrice + markup;

    const shipmentData: Partial<Shipment> = {
      origin: formData.origin,
      destination: formData.destination,
      serviceType: formData.serviceType,
      equipmentType: formData.equipmentType,
      weight: Number(formData.weight),
      items: formData.items.map(item => ({
        id: Math.random().toString(36).substr(2, 9), // Generate temporary ID
        description: item.description || item.commodity,
        quantity: item.quantity,
        weight: item.weight,
        packagingType: item.packagingType,
        commodity: item.commodity,
        dimensions: item.dimensions,
        hazmat: item.hazmat,
      })),
      pricing: {
        basePrice,
        markup,
        finalPrice,
      },
      emailNotifications: {
        to: ['loads@exoduslogistix.com'],
        sent: false,
      },
    };

    onSubmit(shipmentData);
  };

  const fetchGreenscreenData = async () => {
    // Simulate API call to Greenscreens
    // In real implementation, this would call the actual Greenscreens API
    const mockData = {
      basePrice: 3000,
      distance: 500,
      transitTime: 48,
    };
    setGreenscreenData(mockData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Origin */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Origin</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              name="origin.city"
              value={formData.origin.city}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <input
              type="text"
              name="origin.state"
              value={formData.origin.state}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
            <input
              type="text"
              name="origin.zipCode"
              value={formData.origin.zipCode}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Destination */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Destination</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              name="destination.city"
              value={formData.destination.city}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <input
              type="text"
              name="destination.state"
              value={formData.destination.state}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
            <input
              type="text"
              name="destination.zipCode"
              value={formData.destination.zipCode}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Service Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Service Type</label>
          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="FTL">Full Truckload (FTL)</option>
            <option value="LTL">Less Than Truckload (LTL)</option>
            <option value="Shared Truckload">Shared Truckload</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">
            {formData.serviceType === 'FTL' && 'Ideal for large shipments that need the entire truck. Direct, fast delivery with no stops.'}
            {formData.serviceType === 'LTL' && 'Share space (and costs) with other shipments. Great for smaller loads, with a focus on savings and sustainability.'}
            {formData.serviceType === 'Shared Truckload' && 'Perfect for loads under 18 pallets and 30,000 lbs. Combine your freight with others going the same way.'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Equipment Type</label>
          <select
            name="equipmentType"
            value={formData.equipmentType}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="van">Van</option>
            <option value="reefer">Reefer</option>
            <option value="flatbed">Flatbed</option>
          </select>
        </div>
      </div>

      {/* Shipment Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Pickup Date</label>
          <input
            type="date"
            name="pickupDate"
            value={formData.pickupDate}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Weight (lbs)</label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Item Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Item Details</h3>
        {formData.items.map((item, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700">Commodity</label>
              <input
                type="text"
                name={`items.${index}.commodity`}
                value={item.commodity}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Packaging Type</label>
              <select
                name={`items.${index}.packagingType`}
                value={item.packagingType}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="pallets">Pallets</option>
                <option value="crates">Crates</option>
                <option value="box">Box</option>
                <option value="drum">Drum</option>
                <option value="roll">Roll</option>
                <option value="bundle">Bundle</option>
                <option value="bale">Bale</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Information */}
      {greenscreenData && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Pricing Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Base Price</p>
              <p className="text-lg font-semibold">${greenscreenData.basePrice.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Markup (15%)</p>
              <p className="text-lg font-semibold">${(greenscreenData.basePrice * 0.15).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Final Price</p>
              <p className="text-lg font-semibold text-blue-600">
                ${(greenscreenData.basePrice * 1.15).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={fetchGreenscreenData}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Get Quote
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          Create Shipment
        </button>
      </div>
    </form>
  );
}; 