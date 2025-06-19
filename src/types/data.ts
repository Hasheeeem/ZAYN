import React, { createContext, useContext, useState, useEffect } from 'react';
import { Lead, User } from '../types/data';
import apiService from '../services/api';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext';

interface UserTargets {
  salesTarget: number;
  invoiceTarget: number;
  salesAchieved: number;
  invoiceAchieved: number;
}

interface DataContextType {
  leads: Lead[];
  managementUsers: User[];
  salespeople: User[];
  userTargets: Record<string, UserTargets>;
  loading: boolean;
  addLead: (lead: Omit<Lead, 'id'>) => Promise<void>;
  updateLead: (lead: Lead) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  bulkDeleteLeads: (ids: string[]) => Promise<void>;
  bulkAssignLeads: (ids: string[], salesPersonId: string) => Promise<void>;
  filterLeads: (searchTerm: string, status: string) => Lead[];
  refreshData: () => Promise<void>;
  updateUserTargets: (userId: string, targets: Partial<UserTargets>) => Promise<void>;
  calculateUserProgress: (userId: string) => { salesProgress: number; invoiceProgress: number };
  getUserTargets: (userId: string) => Promise<UserTargets | null>;
  setUserTargets: (userId: string, targets: { salesTarget: number; invoiceTarget: number }) => Promise<void>;
}

export const DataContext = createContext<DataContextType>({
  leads: [],
  managementUsers: [],
  salespeople: [],
  userTargets: {},
  loading: false,
  addLead: async () => {},
  updateLead: async () => {},
  deleteLead: async () => {},
  bulkDeleteLeads: async () => {},
  bulkAssignLeads: async () => {},
  filterLeads: () => [],
  refreshData: async () => {},
  updateUserTargets: async () => {},
  calculateUserProgress: () => ({ salesProgress: 0, invoiceProgress: 0 }),
  getUserTargets: async () => null,
  setUserTargets: async () => {}
});

export const useData = () => useContext(DataContext);

export interface Lead {
  id: number | string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  domain: string;
  price: number;
  clicks: number;
  update: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source: 'website' | 'referral' | 'call' | 'other';
  assignedTo?: string;
  notes?: string;
  createdAt: string;
  // New fields for the updated form
  companyRepresentativeName?: string;
  companyName?: string;
  pricePaid?: number;
  invoiceBilled?: number;
  // Brand, Product, Location fields
  brand?: string;
  product?: string;
  location?: string;
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

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [managementUsers, setManagementUsers] = useState<User[]>([]);
  const [salespeople, setSalespeople] = useState<User[]>([]);
  const [userTargets, setUserTargetsState] = useState<Record<string, UserTargets>>({});
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const { authState } = useAuth();

  const calculateUserAchievements = (userId: string, allLeads: Lead[]) => {
    const userLeads = allLeads.filter(lead => lead.assignedTo === userId);
    const salesAchieved = userLeads.reduce((sum, lead) => sum + (lead.pricePaid || lead.price || 0), 0);
    const invoiceAchieved = userLeads.reduce((sum, lead) => sum + (lead.invoiceBilled || lead.clicks || 0), 0);
    
    return { salesAchieved, invoiceAchieved };
  };

  const loadUserTargets = async () => {
    try {
      if (authState.user?.role === 'admin') {
        // Load all targets for admin
        const response = await apiService.getAllTargets();
        if (response.success) {
          const targetsMap: Record<string, UserTargets> = {};
          response.data.forEach((target: any) => {
            targetsMap[target.userId] = {
              salesTarget: target.salesTarget,
              invoiceTarget: target.invoiceTarget,
              salesAchieved: target.salesAchieved,
              invoiceAchieved: target.invoiceAchieved
            };
          });
          setUserTargetsState(targetsMap);
        }
      } else if (authState.user?.id) {
        // Load only current user's targets for sales users
        const response = await apiService.getUserTargets(authState.user.id.toString());
        if (response.success && response.data) {
          setUserTargetsState({
            [authState.user.id.toString()]: {
              salesTarget: response.data.salesTarget,
              invoiceTarget: response.data.invoiceTarget,
              salesAchieved: response.data.salesAchieved,
              invoiceAchieved: response.data.invoiceAchieved
            }
          });
        }
      }
    } catch (error) {
      console.error('Error loading user targets:', error);
    }
  };

  const updateUserTargets = async (userId: string, targets: Partial<UserTargets>) => {
    try {
      setUserTargetsState(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          ...targets
        }
      }));
    } catch (error) {
      console.error('Error updating user targets:', error);
    }
  };

  const getUserTargets = async (userId: string): Promise<UserTargets | null> => {
    try {
      const response = await apiService.getUserTargets(userId);
      if (response.success && response.data) {
        return {
          salesTarget: response.data.salesTarget,
          invoiceTarget: response.data.invoiceTarget,
          salesAchieved: response.data.salesAchieved,
          invoiceAchieved: response.data.invoiceAchieved
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user targets:', error);
      return null;
    }
  };

  const setUserTargets = async (userId: string, targets: { salesTarget: number; invoiceTarget: number }) => {
    try {
      const response = await apiService.createOrUpdateTargets({
        userId,
        salesTarget: targets.salesTarget,
        invoiceTarget: targets.invoiceTarget,
        period: 'monthly'
      });

      if (response.success) {
        // Update local state
        setUserTargetsState(prev => ({
          ...prev,
          [userId]: {
            salesTarget: targets.salesTarget,
            invoiceTarget: targets.invoiceTarget,
            salesAchieved: response.data.salesAchieved || 0,
            invoiceAchieved: response.data.invoiceAchieved || 0
          }
        }));
        showNotification('Targets updated successfully', 'success');
      } else {
        throw new Error(response.message || 'Failed to update targets');
      }
    } catch (error: any) {
      console.error('Error setting user targets:', error);
      showNotification(error.message || 'Failed to update targets', 'error');
      throw error;
    }
  };

  const calculateUserProgress = (userId: string) => {
    const targets = userTargets[userId];
    if (!targets) return { salesProgress: 0, invoiceProgress: 0 };

    const salesProgress = targets.salesTarget > 0 ? (targets.salesAchieved / targets.salesTarget) * 100 : 0;
    const invoiceProgress = targets.invoiceTarget > 0 ? (targets.invoiceAchieved / targets.invoiceTarget) * 100 : 0;

    return { salesProgress, invoiceProgress };
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      // Always fetch leads (filtered by role on backend)
      const leadsResponse = await apiService.getLeads();
      if (leadsResponse.success) {
        setLeads(leadsResponse.data);
      }

      // Load user targets
      await loadUserTargets();

      // Only fetch users and salespeople if user is admin
      if (authState.user?.role === 'admin') {
        const [usersResponse, salespeopleResponse] = await Promise.all([
          apiService.getUsers(),
          apiService.getSalespeople()
        ]);

        if (usersResponse.success) {
          setManagementUsers(usersResponse.data);
        }
        if (salespeopleResponse.success) {
          setSalespeople(salespeopleResponse.data);
        }
      } else {
        // For sales users, only get salespeople for assignment purposes
        const salespeopleResponse = await apiService.getSalespeople();
        if (salespeopleResponse.success) {
          setSalespeople(salespeopleResponse.data);
        }
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      showNotification('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authState.isAuthenticated) {
      refreshData();
    }
  }, [authState.isAuthenticated, authState.user?.role]);

  const addLead = async (leadData: Omit<Lead, 'id'>) => {
    try {
      // Transform the data to match backend expectations
      const backendData = {
        firstName: leadData.firstName,
        lastName: leadData.lastName || '',
        email: leadData.email,
        phone: leadData.phone || null,
        domain: leadData.domain,
        price: Number(leadData.price) || 0,
        clicks: Number(leadData.invoiceBilled) || 0, // Map invoiceBilled to clicks
        status: leadData.status,
        source: leadData.source,
        assignedTo: leadData.assignedTo || null,
        notes: leadData.notes || null,
        // Include the new Brand, Product, Location fields
        brand: leadData.brand || null,
        product: leadData.product || null,
        location: leadData.location || null
      };

      console.log('Sending lead data to backend:', backendData);
      
      const response = await apiService.createLead(backendData);
      if (response.success) {
        const newLead = response.data;
        setLeads(prev => [...prev, newLead]);
        
        // Refresh targets to get updated achievements
        await loadUserTargets();
        
        showNotification('Lead added successfully', 'success');
      } else {
        throw new Error(response.message || 'Failed to add lead');
      }
    } catch (error: any) {
      console.error('Error adding lead:', error);
      let errorMessage = 'Failed to add lead';
      
      if (error.message) {
        if (error.message.includes('422')) {
          errorMessage = 'Invalid data format. Please check all required fields.';
        } else if (error.message.includes('400')) {
          errorMessage = 'Bad request. Please check your input data.';
        } else {
          errorMessage = error.message;
        }
      }
      
      showNotification(errorMessage, 'error');
      throw error;
    }
  };

  const updateLead = async (updatedLead: Lead) => {
    try {
      // Transform the data to match backend expectations
      const backendData = {
        firstName: updatedLead.firstName,
        lastName: updatedLead.lastName || '',
        email: updatedLead.email,
        phone: updatedLead.phone || null,
        domain: updatedLead.domain,
        price: Number(updatedLead.price) || 0,
        clicks: Number(updatedLead.invoiceBilled) || 0, // Map invoiceBilled to clicks
        status: updatedLead.status,
        source: updatedLead.source,
        assignedTo: updatedLead.assignedTo || null,
        notes: updatedLead.notes || null,
        // Include the new Brand, Product, Location fields
        brand: updatedLead.brand || null,
        product: updatedLead.product || null,
        location: updatedLead.location || null
      };

      const response = await apiService.updateLead(updatedLead.id.toString(), backendData);
      if (response.success) {
        setLeads(prev => prev.map(lead => 
          lead.id === updatedLead.id ? response.data : lead
        ));
        
        // Refresh targets to get updated achievements
        await loadUserTargets();
        
        showNotification('Lead updated successfully', 'success');
      } else {
        throw new Error(response.message || 'Failed to update lead');
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      showNotification('Failed to update lead', 'error');
      throw error;
    }
  };

  const deleteLead = async (id: string) => {
    try {
      const response = await apiService.deleteLead(id);
      if (response.success) {
        setLeads(prev => prev.filter(lead => lead.id.toString() !== id));
        
        // Refresh targets to get updated achievements
        await loadUserTargets();
        
        showNotification('Lead deleted successfully', 'success');
      } else {
        throw new Error(response.message || 'Failed to delete lead');
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      showNotification('Failed to delete lead', 'error');
      throw error;
    }
  };

  const bulkDeleteLeads = async (ids: string[]) => {
    try {
      const response = await apiService.bulkDeleteLeads(ids);
      if (response.success) {
        setLeads(prev => prev.filter(lead => !ids.includes(lead.id.toString())));
        
        // Refresh targets to get updated achievements
        await loadUserTargets();
        
        showNotification(`${ids.length} leads deleted successfully`, 'success');
      } else {
        throw new Error(response.message || 'Failed to delete leads');
      }
    } catch (error) {
      console.error('Error bulk deleting leads:', error);
      showNotification('Failed to delete leads', 'error');
      throw error;
    }
  };

  const bulkAssignLeads = async (ids: string[], salesPersonId: string) => {
    try {
      const response = await apiService.bulkAssignLeads(ids, salesPersonId);
      if (response.success) {
        setLeads(prev => prev.map(lead => 
          ids.includes(lead.id.toString()) 
            ? { ...lead, assignedTo: salesPersonId }
            : lead
        ));
        
        // Refresh targets to get updated achievements
        await loadUserTargets();
        
        showNotification(`${ids.length} leads assigned successfully`, 'success');
      } else {
        throw new Error(response.message || 'Failed to assign leads');
      }
    } catch (error) {
      console.error('Error bulk assigning leads:', error);
      showNotification('Failed to assign leads', 'error');
      throw error;
    }
  };

  const filterLeads = (searchTerm: string, status: string): Lead[] => {
    return leads.filter(lead => {
      const matchesSearch = searchTerm === '' || 
        lead.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.lastName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = status === '' || lead.status === status;
      
      return matchesSearch && matchesStatus;
    });
  };

  return (
    <DataContext.Provider value={{ 
      leads, 
      managementUsers,
      salespeople,
      userTargets,
      loading,
      addLead,
      updateLead,
      deleteLead,
      bulkDeleteLeads,
      bulkAssignLeads,
      filterLeads,
      refreshData,
      updateUserTargets,
      calculateUserProgress,
      getUserTargets,
      setUserTargets
    }}>
      {children}
    </DataContext.Provider>
  );
};