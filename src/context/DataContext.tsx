import React, { createContext, useContext, useState } from 'react';
import { format } from 'date-fns';
import { Lead, Opportunity } from '../types/data';

interface DataContextType {
  leads: Lead[];
  opportunities: Opportunity[];
  managementUsers: any[]; // Using any for simplicity
  addLead: (lead: Omit<Lead, 'id' | 'date'>) => void;
  addOpportunity: (opportunity: Omit<Opportunity, 'id'>) => void;
  filterLeads: (searchTerm: string, status: string, source: string) => Lead[];
  filterOpportunities: (searchTerm: string, status: string, dateFilter: string) => Opportunity[];
}

const initialLeads: Lead[] = [
  { id: 1, name: 'John Smith', email: 'john.smith@email.com', phone: '+1 234 567 8900', status: 'new', source: 'website', date: format(new Date('2025-06-01'), 'MMM dd, yyyy') },
  { id: 2, name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '+1 234 567 8901', status: 'contacted', source: 'referral', date: format(new Date('2025-05-30'), 'MMM dd, yyyy') },
  { id: 3, name: 'Mike Wilson', email: 'mike.w@email.com', phone: '+1 234 567 8902', status: 'qualified', source: 'social', date: format(new Date('2025-05-28'), 'MMM dd, yyyy') },
  { id: 4, name: 'Emily Davis', email: 'emily.d@email.com', phone: '+1 234 567 8903', status: 'new', source: 'email', date: format(new Date('2025-05-27'), 'MMM dd, yyyy') },
  { id: 5, name: 'Alex Brown', email: 'alex.b@email.com', phone: '+1 234 567 8904', status: 'qualified', source: 'website', date: format(new Date('2025-05-25'), 'MMM dd, yyyy') }
];

const initialOpportunities: Opportunity[] = [
  { id: 1, domain: 'alpha.com', price: 45, clicks: 3330, update: 'Feb 13', status: 'expiring' },
  { id: 2, domain: 'beta.com', price: 70, clicks: 3330, update: 'Jan 15', status: 'registered' },
  { id: 3, domain: 'gamma.com', price: 25, clicks: 3330, update: 'Mar 09', status: 'registered' },
  { id: 4, domain: 'delta.com', price: 50, clicks: 3330, update: 'Feb 10', status: 'flagged' },
  { id: 5, domain: 'epsilon.com', price: 35, clicks: 3330, update: 'Feb 18', status: 'registered' }
];

const initialManagementUsers = [
  { id: 1, name: 'Admin User', email: 'admin@lead.com', role: 'admin', status: 'active', lastLogin: format(new Date('2025-06-03'), 'MMM dd, yyyy') },
  { id: 2, name: 'Jane Manager', email: 'jane@lead.com', role: 'manager', status: 'active', lastLogin: format(new Date('2025-06-02'), 'MMM dd, yyyy') },
  { id: 3, name: 'Bob Supervisor', email: 'bob@lead.com', role: 'manager', status: 'inactive', lastLogin: format(new Date('2025-05-30'), 'MMM dd, yyyy') },
  { id: 4, name: 'Lisa Agent', email: 'lisa@lead.com', role: 'user', status: 'active', lastLogin: format(new Date('2025-06-01'), 'MMM dd, yyyy') }
];

export const DataContext = createContext<DataContextType>({
  leads: [],
  opportunities: [],
  managementUsers: [],
  addLead: () => {},
  addOpportunity: () => {},
  filterLeads: () => [],
  filterOpportunities: () => []
});

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(initialOpportunities);
  const [managementUsers] = useState(initialManagementUsers);

  const addLead = (lead: Omit<Lead, 'id' | 'date'>) => {
    const newLead: Lead = {
      ...lead,
      id: leads.length + 1,
      date: format(new Date(), 'MMM dd, yyyy')
    };
    setLeads([...leads, newLead]);
  };

  const addOpportunity = (opportunity: Omit<Opportunity, 'id'>) => {
    const newOpportunity: Opportunity = {
      ...opportunity,
      id: opportunities.length + 1
    };
    setOpportunities([...opportunities, newOpportunity]);
  };

  const filterLeads = (searchTerm: string, status: string, source: string): Lead[] => {
    return leads.filter(lead => {
      const matchesSearch = searchTerm === '' || 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        lead.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = status === '' || lead.status === status;
      const matchesSource = source === '' || lead.source === source;
      
      return matchesSearch && matchesStatus && matchesSource;
    });
  };

  const filterOpportunities = (searchTerm: string, status: string, dateFilter: string): Opportunity[] => {
    return opportunities.filter(opp => {
      const matchesSearch = searchTerm === '' || opp.domain.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = status === '' || opp.status === status;
      const matchesDate = dateFilter === '' || true;
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  };

  return (
    <DataContext.Provider value={{ 
      leads, 
      opportunities, 
      managementUsers, 
      addLead, 
      addOpportunity, 
      filterLeads, 
      filterOpportunities 
    }}>
      {children}
    </DataContext.Provider>
  );
};