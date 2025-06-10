import React, { createContext, useContext, useState } from 'react';
import { format } from 'date-fns';
import { Lead, User } from '../types/data';

interface DataContextType {
  leads: Lead[];
  managementUsers: User[];
  salespeople: User[];
  addLead: (lead: Omit<Lead, 'id'>) => void;
  updateLead: (lead: Lead) => void;
  deleteLead: (id: number) => void;
  filterLeads: (searchTerm: string, status: string) => Lead[];
}

const currentDate = new Date().toISOString();

const initialLeads: Lead[] = [
  { 
    id: 1, 
    domain: 'alpha.com', 
    price: 45, 
    clicks: 3330, 
    update: 'Feb 13', 
    status: 'expiring',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@alpha.com',
    phone: '555-0101',
    source: 'referral',
    notes: 'Interested in premium domains',
    createdAt: currentDate
  },
  { 
    id: 2, 
    domain: 'beta.com', 
    price: 70, 
    clicks: 3330, 
    update: 'Jan 15', 
    status: 'registered',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@beta.com',
    phone: '555-0102',
    source: 'website',
    notes: 'Looking for short domains',
    createdAt: currentDate
  },
  { 
    id: 3, 
    domain: 'gamma.com', 
    price: 25, 
    clicks: 3330, 
    update: 'Mar 09', 
    status: 'registered',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike@gamma.com',
    phone: '555-0103',
    source: 'direct',
    notes: 'Budget conscious buyer',
    createdAt: currentDate
  },
  { 
    id: 4, 
    domain: 'delta.com', 
    price: 50, 
    clicks: 3330, 
    update: 'Feb 10', 
    status: 'flagged',
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'sarah@delta.com',
    phone: '555-0104',
    source: 'referral',
    notes: 'Needs immediate follow-up',
    createdAt: currentDate
  },
  { 
    id: 5, 
    domain: 'epsilon.com', 
    price: 35, 
    clicks: 3330, 
    update: 'Feb 18', 
    status: 'registered',
    firstName: 'Tom',
    lastName: 'Brown',
    email: 'tom@epsilon.com',
    phone: '555-0105',
    source: 'website',
    notes: 'Multiple domain interest',
    createdAt: currentDate
  }
];

const initialManagementUsers: User[] = [
  { 
    id: 1, 
    name: 'Admin User', 
    email: 'admin@lead.com', 
    role: 'admin', 
    status: 'active', 
    lastLogin: format(new Date(), 'MMM dd, yyyy')
  },
  { 
    id: 2, 
    name: 'Jane Manager', 
    email: 'jane@lead.com', 
    role: 'manager', 
    status: 'active', 
    lastLogin: format(new Date(), 'MMM dd, yyyy')
  },
  { 
    id: 3, 
    name: 'Bob Supervisor', 
    email: 'bob@lead.com', 
    role: 'manager', 
    status: 'inactive', 
    lastLogin: format(new Date(), 'MMM dd, yyyy')
  },
  { 
    id: 4, 
    name: 'Lisa Agent', 
    email: 'lisa@lead.com', 
    role: 'user', 
    status: 'active', 
    lastLogin: format(new Date(), 'MMM dd, yyyy')
  }
];

const initialSalespeople: User[] = [
  {
    id: 5,
    name: 'Alex Sales',
    email: 'alex@lead.com',
    role: 'sales',
    status: 'active',
    lastLogin: format(new Date(), 'MMM dd, yyyy'),
    performance: {
      leadsConverted: 25,
      conversionRate: 0.75
    }
  },
  {
    id: 6,
    name: 'Maria Sales',
    email: 'maria@lead.com',
    role: 'sales',
    status: 'active',
    lastLogin: format(new Date(), 'MMM dd, yyyy'),
    performance: {
      leadsConverted: 30,
      conversionRate: 0.80
    }
  }
];

export const DataContext = createContext<DataContextType>({
  leads: [],
  managementUsers: [],
  salespeople: [],
  addLead: () => {},
  updateLead: () => {},
  deleteLead: () => {},
  filterLeads: () => []
});

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [managementUsers] = useState(initialManagementUsers);
  const [salespeople] = useState(initialSalespeople);

  const addLead = (lead: Omit<Lead, 'id'>) => {
    const newLead: Lead = {
      ...lead,
      id: leads.length + 1,
      createdAt: new Date().toISOString()
    };
    setLeads([...leads, newLead]);
  };

  const updateLead = (updatedLead: Lead) => {
    setLeads(leads.map(lead => 
      lead.id === updatedLead.id ? updatedLead : lead
    ));
  };

  const deleteLead = (id: number) => {
    setLeads(leads.filter(lead => lead.id !== id));
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
      salespeople,
      addLead,
      updateLead,
      deleteLead,
      filterLeads
    }}>
      {children}
    </DataContext.Provider>
  );
};