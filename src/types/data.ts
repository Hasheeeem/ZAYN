export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'lost';
  source: 'website' | 'referral' | 'social' | 'email';
  date: string;
  notes?: string;
}

export interface Opportunity {
  id: number;
  domain: string;
  price: number;
  clicks: number;
  update: string;
  status: 'registered' | 'expiring' | 'expired' | 'flagged';
  description?: string;
}

export interface DashboardStat {
  id: string;
  title: string;
  value: string | number;
  icon: string;
  color: string;
}