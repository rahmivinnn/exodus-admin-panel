export type UserRole = 'admin' | 'dispatcher' | 'manager';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'shipper' | 'carrier' | 'agent';
  company?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export type EquipmentType = 
  | 'Dry Van'
  | 'Reefer'
  | 'Flatbed'
  | 'Step Deck'
  | 'Double Drop'
  | 'Lowboy'
  | 'Power Only';

export type ServiceType = 'LTL' | 'FTL' | 'Refrigerated' | 'Hazmat' | 'Expedited' | 'Intermodal';
export type PackagingType = 'pallets' | 'crates' | 'box' | 'drum' | 'roll' | 'bundle' | 'bale';
export type LoadStatus = 'pending' | 'in_transit' | 'delivered' | 'cancelled' | 'on_hold' | 'scheduled';

export interface Location {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface LoadRequest {
  id: string;
  origin: Address;
  destination: Address;
  serviceType: ServiceType;
  equipmentType: string;
  weight: number;
  shipDate: string;
  status: LoadStatus;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface LoadHistory {
  id: string;
  loadId: string;
  status: LoadStatus;
  note: string;
  updatedBy: string;
  updatedAt: string;
}

export interface SmartBundle {
  id: string;
  loads: LoadRequest[];
  origin: Location;
  destination: Location;
  totalWeight: number;
  totalPallets: number;
  estimatedRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: 'shipment_update' | 'quote_received' | 'document_uploaded' | 'status_change' | 'alert';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface RouteInfo {
  distance: number; // in miles
  duration: number; // in minutes
  polyline: string; // encoded polyline for map display
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  loadRequest: LoadRequest;
  carrier: Carrier;
  status: LoadStatus;
  origin: Address;
  destination: Address;
  serviceType: ServiceType;
  items: ShipmentItem[];
  pickupDate: string;
  deliveryDate: string;
  createdAt: string;
  updatedAt: string;
  documents: Document[];
  events: ShipmentEvent[];
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
  hazmat: boolean;
  temperature?: {
    min: number;
    max: number;
  };
}

export interface Quote {
  id: string;
  loadRequest: LoadRequest;
  carrier: Carrier;
  price: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  validUntil: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Carrier {
  id: string;
  name: string;
  mcNumber: string;
  dotNumber: string;
  active: boolean;
  rating: number;
  equipment: string[];
  insurance: {
    provider: string;
    policyNumber: string;
    coverage: number;
    expiryDate: string;
  };
  contacts: {
    name: string;
    email: string;
    phone: string;
    role: string;
  }[];
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  type: 'BOL' | 'POD' | 'Invoice' | 'Insurance' | 'Contract' | 'Other';
  name: string;
  url: string;
  uploadedBy: {
    id: string;
    name: string;
    role: string;
  };
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export interface Industry {
  id: string;
  name: string;
  description: string;
  services: ServiceType[];
  specialRequirements?: string[];
}

export interface Audit {
  id: string;
  type: 'Carrier' | 'Shipment' | 'Customer';
  targetId: string;
  findings: {
    category: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    recommendation: string;
  }[];
  status: 'pending' | 'in_progress' | 'completed';
  auditor: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  id: string;
  company: {
    name: string;
    address: Address;
    phone: string;
    email: string;
    website: string;
  };
  features: {
    enableSTL: boolean;
    enableHazmat: boolean;
    enableRefrigerated: boolean;
    enableGovernment: boolean;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  updatedAt: string;
}

export interface ShipmentEvent {
  id: string;
  type: 'pickup' | 'delivery' | 'status_change' | 'location_update' | 'document_upload';
  timestamp: string;
  location?: Address;
  status?: LoadStatus;
  description: string;
  user?: {
    id: string;
    name: string;
    role: string;
  };
}

export interface DashboardStats {
  activeLoads: number;
  pendingQuotes: number;
  activeCarriers: number;
  totalRevenue: number;
  onTimeDeliveries: number;
  totalShipments: number;
  hazmatShipments: number;
  refrigeratedShipments: number;
  serviceDistribution: Record<ServiceType, number>;
  recentEvents: ShipmentEvent[];
  alerts: Notification[];
} 