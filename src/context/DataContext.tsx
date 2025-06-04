import React, { createContext, useContext, useState } from 'react';
import { format } from 'date-fns';
import { Lead, User } from '../types/data';

interface DataContextType {
  leads: Lead[];
  managementUsers: User[];
  addLead: (lead: Omit<Lead, 'id'>) => void;
  filterLeads: (searchTerm: string, status: string) => Lead[];
}

const initialLeads: Lead[] = [
  { id: 1, domain: 'alpha.com', price: 45, clicks: 3330, update: 'Feb 13', status: 'expiring' },
  { id: 2, domain: 'beta.com', price: 70, clicks: 3330, update: 'Jan 15', status: 'registered' },
  { id: 3, domain: 'gamma.com', price: 25, clicks: 3330, update: 'Mar 09', status: 'registered' },
  { id: 4, domain: 'delta.com', price: 50, clicks: 3330, update: 'Feb 10', status: 'flagged' },
  { id: 5, domain: 'epsilon.com', price: 35, clicks: 3330, update: 'Feb 18', status: 'registered' }
];

const initialManagementUsers: User[] = [
  { id: 1, name: 'Admin User', email: 'admin@lead.com', role: 'admin', status: 'active', lastLogin: format(new Date('2025-06-03'), 'MMM dd, yyyy') },
  { id: 2, name: 'Jane Manager', email: 'jane@lead.com', role: 'manager', status: 'active', lastLogin: format(new Date('2025-06-02'), 'MMM dd, yyyy') },
  { id: 3, name: 'Bob Supervisor', email: 'bob@lead.com', role: 'manager', status: 'inactive', lastLogin: format(new Date('2025-05-30'), 'MMM dd, yyyy') },
  { id: 4, name: 'Lisa Agent', email: 'lisa@lead.com', role: 'user', status: 'active', lastLogin: format(new Date('2025-06-01'), 'MMM dd, yyyy') }
];

export const DataContext = createContext<DataContextType>({
  leads: [],
  managementUsers: [],
  addLead: () => {},
  filterLeads: () => []
});

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [managementUsers] = useState(initialManagementUsers);

  const addLead = (lead: Omit<Lead, 'id'>) => {
    const newLead: Lead = {
      ...lead,
      id: leads.length + 1
    };
    setLeads([...leads, newLead]);
  };

  const filterLeads = (searchTerm: string, status: string): Lead[] => {
    return leads.filter(lead => {
      const matchesSearch = searchTerm === '' || 
        lead.domain.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = status === '' || lead.status === status;
      
      return matchesSearch && matchesStatus;
    });
  };

  return (
    <DataContext.Provider value={{ 
      leads, 
      managementUsers, 
      addLead, 
      filterLeads
    }}>
      {children}
    </DataContext.Provider>
  );
};