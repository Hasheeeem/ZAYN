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
  updateUserTargets: (userId: string, targets: Partial<UserTargets>) => void;
  calculateUserProgress: (userId: string) => { salesProgress: number; invoiceProgress: number };
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
  updateUserTargets: () => {},
  calculateUserProgress: () => ({ salesProgress: 0, invoiceProgress: 0 })
});

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [managementUsers, setManagementUsers] = useState<User[]>([]);
  const [salespeople, setSalespeople] = useState<User[]>([]);
  const [userTargets, setUserTargets] = useState<Record<string, UserTargets>>({});
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const { authState } = useAuth();

  const calculateUserAchievements = (userId: string, allLeads: Lead[]) => {
    const userLeads = allLeads.filter(lead => lead.assignedTo === userId);
    const salesAchieved = userLeads.reduce((sum, lead) => sum + (lead.pricePaid || lead.price || 0), 0);
    const invoiceAchieved = userLeads.reduce((sum, lead) => sum + (lead.invoiceBilled || lead.clicks || 0), 0);
    
    return { salesAchieved, invoiceAchieved };
  };

  const updateUserTargets = (userId: string, targets: Partial<UserTargets>) => {
    setUserTargets(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        ...targets
      }
    }));
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
        
        // Update user achievements based on leads
        Object.keys(userTargets).forEach(userId => {
          const achievements = calculateUserAchievements(userId, leadsResponse.data);
          updateUserTargets(userId, achievements);
        });
      }

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
        notes: leadData.notes || null
      };

      console.log('Sending lead data to backend:', backendData);
      
      const response = await apiService.createLead(backendData);
      if (response.success) {
        const newLead = response.data;
        setLeads(prev => [...prev, newLead]);
        
        // Update user achievements if lead is assigned
        if (newLead.assignedTo) {
          const achievements = calculateUserAchievements(newLead.assignedTo, [...leads, newLead]);
          updateUserTargets(newLead.assignedTo, achievements);
        }
        
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
        notes: updatedLead.notes || null
      };

      const response = await apiService.updateLead(updatedLead.id.toString(), backendData);
      if (response.success) {
        const oldLead = leads.find(l => l.id === updatedLead.id);
        setLeads(prev => prev.map(lead => 
          lead.id === updatedLead.id ? response.data : lead
        ));
        
        // Update achievements for both old and new assigned users
        const updatedLeads = leads.map(lead => 
          lead.id === updatedLead.id ? response.data : lead
        );
        
        if (oldLead?.assignedTo && oldLead.assignedTo !== response.data.assignedTo) {
          const oldAchievements = calculateUserAchievements(oldLead.assignedTo, updatedLeads);
          updateUserTargets(oldLead.assignedTo, oldAchievements);
        }
        
        if (response.data.assignedTo) {
          const newAchievements = calculateUserAchievements(response.data.assignedTo, updatedLeads);
          updateUserTargets(response.data.assignedTo, newAchievements);
        }
        
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
      const leadToDelete = leads.find(l => l.id.toString() === id);
      const response = await apiService.deleteLead(id);
      if (response.success) {
        setLeads(prev => prev.filter(lead => lead.id.toString() !== id));
        
        // Update achievements for assigned user
        if (leadToDelete?.assignedTo) {
          const updatedLeads = leads.filter(lead => lead.id.toString() !== id);
          const achievements = calculateUserAchievements(leadToDelete.assignedTo, updatedLeads);
          updateUserTargets(leadToDelete.assignedTo, achievements);
        }
        
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
      const leadsToDelete = leads.filter(lead => ids.includes(lead.id.toString()));
      const response = await apiService.bulkDeleteLeads(ids);
      if (response.success) {
        setLeads(prev => prev.filter(lead => !ids.includes(lead.id.toString())));
        
        // Update achievements for all affected users
        const affectedUsers = new Set(leadsToDelete.map(lead => lead.assignedTo).filter(Boolean));
        const updatedLeads = leads.filter(lead => !ids.includes(lead.id.toString()));
        
        affectedUsers.forEach(userId => {
          if (userId) {
            const achievements = calculateUserAchievements(userId, updatedLeads);
            updateUserTargets(userId, achievements);
          }
        });
        
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
      const leadsToUpdate = leads.filter(lead => ids.includes(lead.id.toString()));
      const response = await apiService.bulkAssignLeads(ids, salesPersonId);
      if (response.success) {
        setLeads(prev => prev.map(lead => 
          ids.includes(lead.id.toString()) 
            ? { ...lead, assignedTo: salesPersonId }
            : lead
        ));
        
        // Update achievements for all affected users
        const affectedUsers = new Set([
          salesPersonId,
          ...leadsToUpdate.map(lead => lead.assignedTo).filter(Boolean)
        ]);
        
        const updatedLeads = leads.map(lead => 
          ids.includes(lead.id.toString()) 
            ? { ...lead, assignedTo: salesPersonId }
            : lead
        );
        
        affectedUsers.forEach(userId => {
          if (userId) {
            const achievements = calculateUserAchievements(userId, updatedLeads);
            updateUserTargets(userId, achievements);
          }
        });
        
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
      calculateUserProgress
    }}>
      {children}
    </DataContext.Provider>
  );
};