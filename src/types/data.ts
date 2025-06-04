export interface Lead {
  id: number | string;
  domain: string;
  price: number;
  clicks: number;
  update: string;
  status: 'registered' | 'expiring' | 'expired' | 'flagged';
  owner?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive';
  lastLogin: string;
}

export interface Brand {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  status: 'active' | 'inactive';
}

export interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  status: 'active' | 'inactive';
}

export interface LeadStatus {
  id: number;
  name: string;
  color: string;
  description: string;
}

export interface LeadSource {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface LeadOwner {
  id: number;
  userId: number;
  leadCount: number;
  performance: number;
}