// Clean Lead interface with ONLY your desired fields
export interface Lead {
  id: number | string;
  
  // YOUR DESIRED FIELDS ONLY
  companyRepresentativeName: string;
  companyName: string;
  email: string;
  phone?: string;
  source: 'website' | 'referral' | 'call' | 'other';
  pricePaid: number;
  invoiceBilled: number;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  assignedTo?: string;
  brand?: string;
  product?: string;
  location?: string;
  notes?: string;
  
  // SYSTEM FIELDS
  update: string;
  createdAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'sales';
  status: 'active' | 'inactive';
  lastLogin?: string;
  phone_number?: string;
  created_at?: string;
  performance?: {
    leadsConverted: number;
    conversionRate: number;
  };
}

export interface Opportunity {
  id: number;
  domain: string;
  price: number;
  registrar: string;
  expiryDate: string;
  status: 'registered' | 'expiring' | 'expired' | 'flagged';
  lastChecked: string;
}

export interface Target {
  id: string;
  userId: string;
  salesTarget: number;
  invoiceTarget: number;
  salesAchieved: number;
  invoiceAchieved: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'call' | 'meeting' | 'demo' | 'follow-up' | 'task';
  date: string;
  time: string;
  duration: number;
  description?: string;
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  location?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  category: 'follow-up' | 'admin' | 'prospecting' | 'other';
  assignedTo?: string;
  relatedLead?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface ManagementItem {
  id: string;
  name: string;
  status?: string;
  description?: string;
  sku?: string;
  brandId?: number;
  region?: string;
  currency?: string;
  created_at?: string;
  updated_at?: string;
}