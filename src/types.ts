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
  volume: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  hazmat: boolean;
  packagingType: 'pallets' | 'crates' | 'box' | 'drum' | 'roll' | 'bundle' | 'bale';
  commodity: string;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  greenscreenData?: {
    basePrice: number;
    distance: number;
    transitTime: number;
  };
}

export interface Carrier {
  id: string;
  name: string;
  type: 'LTL' | 'FTL';
  active: boolean;
  contacts: User[];
  equipmentTypes: EquipmentType[];
}

export type EquipmentType = 'van' | 'reefer' | 'flatbed';

export interface Shipment {
  id: string;
  trackingNumber: string;
  origin: Location;
  destination: Location;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  carrier: Carrier;
  serviceType: ServiceType;
  equipmentType: EquipmentType;
  weight: number;
  items: ShipmentItem[];
  createdAt: string;
  updatedAt: string;
  pickupDate: string;
  deliveryDate: string;
  documents: Document[];
  pricing: {
    basePrice: number;
    markup: number;
    finalPrice: number;
  };
  emailNotifications: {
    to: string[];
    sent: boolean;
    sentAt?: string;
  };
}

export interface Quote {
  id: string;
  shipmentId: string;
  carrierId: string;
  price: number;
  basePrice: number;
  markup: number;
  currency: string;
  validUntil: string;
  terms: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
  serviceType: ServiceType;
  equipmentType: EquipmentType;
}

export interface LoadRequest {
  id: string;
  origin: Location;
  destination: Location;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled' | 'scheduled' | 'on_hold';
  serviceType: ServiceType;
  equipmentType: EquipmentType;
  weight: number;
  items: ShipmentItem[];
  createdAt: string;
  updatedAt: string;
  pickupDate: string;
  deliveryDate: string;
  pricing: {
    basePrice: number;
    markup: number;
    finalPrice: number;
  };
  emailNotifications: {
    to: string[];
    sent: boolean;
    sentAt?: string;
  };
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: string;
}

export interface ShipmentEvent {
  id: string;
  shipmentId: string;
  type: 'pickup' | 'delivery' | 'status_change' | 'location_update';
  description: string;
  location?: Location;
  timestamp: string;
}

export interface Document {
  id: string;
  type: 'BOL' | 'POD' | 'Invoice' | 'Customs';
  status: 'pending' | 'approved' | 'rejected';
  url: string;
  createdAt: string;
  updatedAt: string;
}

export type ServiceType = 'FTL' | 'LTL' | 'Shared Truckload';

export interface PricingConfig {
  markupPercentage: number;
  minimumMarkup: number;
  maximumMarkup: number;
  emailNotifications: {
    enabled: boolean;
    recipients: string[];
  };
} 