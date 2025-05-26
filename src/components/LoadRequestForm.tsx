import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LoadRequest, EquipmentType, ServiceType, PackagingType } from '../types';
import { DatePicker } from './DatePicker';

interface LoadRequestFormProps {
  onSubmit: (data: Omit<LoadRequest, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'history'>) => Promise<void>;
}

export const LoadRequestForm: React.FC<LoadRequestFormProps> = ({ onSubmit }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    origin: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
    },
    destination: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
    },
    equipmentType: 'van' as EquipmentType,
    shipDate: '',
    serviceType: 'FTL' as ServiceType,
    commodity: '',
    weight: '',
    packagingType: 'pallets' as PackagingType,
    customerEmail: '',
    customerPhone: '',
    customerName: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form data
      if (!formData.origin.zipCode || !formData.destination.zipCode) {
        throw new Error('Please enter valid ZIP codes for both origin and destination');
      }

      if (!formData.customerEmail || !formData.customerPhone || !formData.customerName) {
        throw new Error('Please fill in all customer information');
      }

      // Convert weight to number
      const weight = parseFloat(formData.weight);
      if (isNaN(weight) || weight <= 0) {
        throw new Error('Please enter a valid weight');
      }

      // Submit form data
      await onSubmit({
        ...formData,
        weight,
        baseRate: 0, // Will be calculated by the API
        finalRate: 0, // Will be calculated by the API
      });

      // Reset form
      setFormData({
        origin: {
          address: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA',
        },
        destination: {
          address: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA',
        },
        equipmentType: 'van',
        shipDate: '',
        serviceType: 'FTL',
        commodity: '',
        weight: '',
        packagingType: 'pallets',
        customerEmail: '',
        customerPhone: '',
        customerName: '',
      });

      // Show success message
      alert('Load request submitted successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit load request';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Origin */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Origin</h3>
            <div>
              <label htmlFor="origin.zipCode" className="block text-sm font-medium text-gray-700">
                ZIP Code
              </label>
              <input
                type="text"
                name="origin.zipCode"
                id="origin.zipCode"
                value={formData.origin.zipCode}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="origin.city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                name="origin.city"
                id="origin.city"
                value={formData.origin.city}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="origin.state" className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                type="text"
                name="origin.state"
                id="origin.state"
                value={formData.origin.state}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                required
              />
            </div>
          </div>

          {/* Destination */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Destination</h3>
            <div>
              <label htmlFor="destination.zipCode" className="block text-sm font-medium text-gray-700">
                ZIP Code
              </label>
              <input
                type="text"
                name="destination.zipCode"
                id="destination.zipCode"
                value={formData.destination.zipCode}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="destination.city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                name="destination.city"
                id="destination.city"
                value={formData.destination.city}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="destination.state" className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                type="text"
                name="destination.state"
                id="destination.state"
                value={formData.destination.state}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Equipment Type */}
          <div>
            <label htmlFor="equipmentType" className="block text-sm font-medium text-gray-700">
              Equipment Type
            </label>
            <select
              id="equipmentType"
              name="equipmentType"
              value={formData.equipmentType}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            >
              <option value="van">Van</option>
              <option value="reefer">Reefer</option>
              <option value="flatbed">Flatbed</option>
            </select>
          </div>

          {/* Ship Date */}
          <div>
            <label htmlFor="shipDate" className="block text-sm font-medium text-gray-700">
              Ship Date
            </label>
            <input
              type="date"
              id="shipDate"
              name="shipDate"
              value={formData.shipDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>
        </div>

        {/* Service Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Service Type</label>
          <div className="mt-2 space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="serviceType-ftl"
                name="serviceType"
                value="FTL"
                checked={formData.serviceType === 'FTL'}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
              />
              <label htmlFor="serviceType-ftl" className="ml-3 block text-sm font-medium text-gray-700">
                Full Truckload (FTL)
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="serviceType-ltl"
                name="serviceType"
                value="LTL"
                checked={formData.serviceType === 'LTL'}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
              />
              <label htmlFor="serviceType-ltl" className="ml-3 block text-sm font-medium text-gray-700">
                Partial/LTL
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="serviceType-shared"
                name="serviceType"
                value="shared"
                checked={formData.serviceType === 'shared'}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
              />
              <label htmlFor="serviceType-shared" className="ml-3 block text-sm font-medium text-gray-700">
                Shared Truckload
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Commodity */}
          <div>
            <label htmlFor="commodity" className="block text-sm font-medium text-gray-700">
              Commodity
            </label>
            <input
              type="text"
              id="commodity"
              name="commodity"
              value={formData.commodity}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>

          {/* Weight */}
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
              Weight (lbs)
            </label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>
        </div>

        {/* Packaging Type */}
        <div>
          <label htmlFor="packagingType" className="block text-sm font-medium text-gray-700">
            Packaging Type
          </label>
          <select
            id="packagingType"
            name="packagingType"
            value={formData.packagingType}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information */}
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
              Customer Name
            </label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">
              Customer Email
            </label>
            <input
              type="email"
              id="customerEmail"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">
              Customer Phone
            </label>
            <input
              type="tel"
              id="customerPhone"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </div>
            ) : (
              'Submit Request'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}; 