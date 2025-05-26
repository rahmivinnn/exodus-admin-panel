import axios from 'axios';
import { User, Shipment, Quote, Carrier } from '../types';

// Use a mock API URL for development
const API_URL = 'https://jsonplaceholder.typicode.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.data);
      return Promise.reject(new Error(error.response.data.message || 'An error occurred'));
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error:', error.request);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request Error:', error.message);
      return Promise.reject(new Error('Request failed. Please try again.'));
    }
  }
);

// Mock data for development
const mockUser: User = {
  id: '1',
  email: 'admin@exodus.com',
  name: 'Admin User',
  role: 'admin',
  company: 'Exodus Logistics',
  phone: '+1 234 567 8900',
  createdAt: new Date().toISOString(),
};

const mockShipments: Shipment[] = [
  {
    id: 'SH001',
    trackingNumber: 'TRK123456789',
    origin: {
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10001'
    },
    destination: {
      address: '456 Market St',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      zipCode: '90001'
    },
    status: 'in_transit',
    carrier: { id: 'C001', name: 'FedEx Freight', type: 'LTL' },
    serviceType: 'LTL',
    weight: 1200,
    items: [
      {
        id: 'I001',
        description: 'Electronics',
        quantity: 10,
        weight: 1200,
        dimensions: { length: 48, width: 40, height: 36 },
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Add more mock shipments as needed
];

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock login validation
    if (email === 'admin@exodus.com' && password === 'admin123') {
      const token = 'mock-jwt-token';
      localStorage.setItem('token', token);
      return { user: mockUser, token };
    }
    throw new Error('Invalid email or password');
  },
  logout: async () => {
    localStorage.removeItem('token');
    return { success: true };
  },
  getCurrentUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    return mockUser;
  },
};

// Shipments API
export const shipmentsAPI = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockShipments;
  },
  getById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const shipment = mockShipments.find(s => s.id === id);
    if (!shipment) throw new Error('Shipment not found');
    return shipment;
  },
  create: async (data: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newShipment: Shipment = {
      ...data,
      id: `SH${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockShipments.push(newShipment);
    return newShipment;
  },
  update: async (id: string, data: Partial<Shipment>) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const index = mockShipments.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Shipment not found');
    mockShipments[index] = {
      ...mockShipments[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockShipments[index];
  },
  delete: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const index = mockShipments.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Shipment not found');
    mockShipments.splice(index, 1);
    return { success: true };
  },
};

// Quotes API
export const quotesAPI = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [];
  },
  getById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    throw new Error('Quote not found');
  },
  create: async (data: Omit<Quote, 'id' | 'createdAt'>) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      ...data,
      id: `Q${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
  },
  update: async (id: string, data: Partial<Quote>) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    throw new Error('Quote not found');
  },
  delete: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  },
};

// Carriers API
export const carriersAPI = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [
      { id: 'C001', name: 'FedEx Freight', type: 'LTL' },
      { id: 'C002', name: 'UPS Freight', type: 'FTL' },
      { id: 'C003', name: 'XPO Logistics', type: 'LTL' },
    ];
  },
  getById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const carriers = await carriersAPI.getAll();
    const carrier = carriers.find(c => c.id === id);
    if (!carrier) throw new Error('Carrier not found');
    return carrier;
  },
  create: async (data: Omit<Carrier, 'id'>) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      ...data,
      id: `C${Math.floor(Math.random() * 1000)}`,
    };
  },
  update: async (id: string, data: Partial<Carrier>) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    throw new Error('Carrier not found');
  },
  delete: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  },
};

export default api; 