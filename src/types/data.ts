export interface Lead {
  id: number | string;
  companyRepresentativeName?: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  domain?: string;
  price?: number;
  pricePaid?: number;
  invoiceBilled?: number;
  clicks?: number;
  update: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source: 'website' | 'referral' | 'call' | 'other';
  assignedTo?: string;
  notes?: string;
  createdAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'sales';
  status: 'active' | 'inactive';
  lastLogin: string;
  performance?: {
    leadsConverted: number;
    conversionRate: number;
  };
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