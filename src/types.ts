export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  company: string;
  phone: string;
  createdAt: string;
}

export interface ShipmentItem {
  id: string;
  description: string;
  quantity: number;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
}

export interface Location {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Carrier {
  id: string;
  name: string;
  type: 'LTL' | 'FTL';
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  origin: Location;
  destination: Location;
  status: 'pending' | 'in_transit' | 'delivered';
  carrier: Carrier;
  serviceType: 'LTL' | 'FTL';
  weight: number;
  items: ShipmentItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  shipmentId: string;
  carrierId: string;
  price: number;
  currency: string;
  validUntil: string;
  terms: string;
  createdAt: string;
} 