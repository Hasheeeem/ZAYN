export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'lost';
  source?: 'referral' | 'ads' | 'website' | 'other';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  assignedTo?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'sales';
  isActive: boolean;
}