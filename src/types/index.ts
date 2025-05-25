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
  avatar?: string;
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
export type LoadStatus = 'pending' | 'accepted' | 'in_transit' | 'delivered' | 'cancelled' | 'on_hold' | 'scheduled';

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
  status: LoadStatus;
  origin: Address;
  destination: Address;
  serviceType: ServiceType;
  pickupDate: string;
  deliveryDate: string;
  items: ShipmentItem[];
  createdAt: string;
  updatedAt: string;
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
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface RouteInfo {
  distance: number; // in miles
  duration: number; // in minutes
  polyline: string; // encoded polyline for map display
}

export interface Shipment {
  id: string;
  status: LoadStatus;
  origin: Address;
  destination: Address;
  serviceType: ServiceType;
  pickupDate: string;
  deliveryDate: string;
  items: ShipmentItem[];
  documents: Document[];
  createdAt: string;
  updatedAt: string;
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
  loadRequestId: string;
  carrierId: string;
  price: number;
  status: 'pending' | 'accepted' | 'rejected';
  validUntil: string;
  notes?: string;
}

export interface Carrier {
  id: string;
  name: string;
  active: boolean;
  contacts: User[];
  equipment: string[];
  insurance: {
    provider: string;
    policyNumber: string;
    expirationDate: string;
  };
}

export interface Document {
  id: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  url: string;
  uploadedAt: string;
  expiresAt?: string;
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
  shipmentId: string;
  type: string;
  description: string;
  location: Address;
  timestamp: string;
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
  pendingDocuments: number;
  activeUsers: number;
} 