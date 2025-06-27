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
  updateUserTargets: () => {},
  calculateUserProgress: () => ({ salesProgress: 0, invoiceProgress: 0 }),
  getUserTargets: async () => null,
  setUserTargets: async () => {}
});

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [managementUsers, setManagementUsers] = useState<User[]>([]);
  const [salespeople, setSalespeople] = useState<User[]>([]);
  const [userTargets, setUserTargetsState] = useState<Record<string, UserTargets>>({});
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const { authState } = useAuth();

  // Clean calculateUserAchievements function - uses your fields
  const calculateUserAchievements = (userId: string, allLeads: Lead[]) => {
    // Only count leads that are assigned to the user AND have status 'converted'
    const userConvertedLeads = allLeads.filter(lead => 
      lead.assignedTo === userId && lead.status === 'converted'
    );
    
    const salesAchieved = userConvertedLeads.reduce((sum, lead) => sum + (lead.pricePaid || 0), 0);
    const invoiceAchieved = userConvertedLeads.reduce((sum, lead) => sum + (lead.invoiceBilled || 0), 0);
    
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
            // Recalculate achievements based on current converted leads
            const achievements = calculateUserAchievements(target.userId, leads);
            targetsMap[target.userId] = {
              salesTarget: target.salesTarget,
              invoiceTarget: target.invoiceTarget,
              salesAchieved: achievements.salesAchieved,
              invoiceAchieved: achievements.invoiceAchieved
            };
          });
          setUserTargetsState(targetsMap);
        }
      } else if (authState.user?.id) {
        // Load only current user's targets for sales users
        const response = await apiService.getUserTargets(authState.user.id.toString());
        if (response.success && response.data) {
          // Recalculate achievements based on current converted leads
          const achievements = calculateUserAchievements(authState.user.id.toString(), leads);
          setUserTargetsState({
            [authState.user.id.toString()]: {
              salesTarget: response.data.salesTarget,
              invoiceTarget: response.data.invoiceTarget,
              salesAchieved: achievements.salesAchieved,
              invoiceAchieved: achievements.invoiceAchieved
            }
          });
        }
      }
    } catch (error) {
      console.error('Error loading user targets:', error);
    }
  };

  const updateUserTargets = (userId: string, targets: Partial<UserTargets>) => {
    setUserTargetsState(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        ...targets
      }
    }));
  };

  const getUserTargets = async (userId: string): Promise<UserTargets | null> => {
    try {
      console.log('Getting targets for user:', userId);
      const response = await apiService.getUserTargets(userId);
      console.log('Get targets response:', response);
      
      if (response.success && response.data) {
        // Recalculate achievements based on current converted leads
        const achievements = calculateUserAchievements(userId, leads);
        return {
          salesTarget: response.data.salesTarget || 0,
          invoiceTarget: response.data.invoiceTarget || 0,
          salesAchieved: achievements.salesAchieved,
          invoiceAchieved: achievements.invoiceAchieved
        };
      }
      return {
        salesTarget: 0,
        invoiceTarget: 0,
        salesAchieved: 0,
        invoiceAchieved: 0
      };
    } catch (error) {
      console.error('Error getting user targets:', error);
      return {
        salesTarget: 0,
        invoiceTarget: 0,
        salesAchieved: 0,
        invoiceAchieved: 0
      };
    }
  };

  const setUserTargets = async (userId: string, targets: { salesTarget: number; invoiceTarget: number }) => {
    try {
      console.log('Setting targets for user:', userId, targets);
      
      const response = await apiService.createOrUpdateTargets({
        userId,
        salesTarget: targets.salesTarget,
        invoiceTarget: targets.invoiceTarget,
        period: 'monthly'
      });

      console.log('Set targets response:', response);

      if (response.success) {
        // Recalculate achievements based on current converted leads
        const achievements = calculateUserAchievements(userId, leads);
        
        // Update local state
        setUserTargetsState(prev => ({
          ...prev,
          [userId]: {
            salesTarget: targets.salesTarget,
            invoiceTarget: targets.invoiceTarget,
            salesAchieved: achievements.salesAchieved,
            invoiceAchieved: achievements.invoiceAchieved
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

  // Recalculate achievements whenever leads change
  useEffect(() => {
    if (leads.length > 0 && Object.keys(userTargets).length > 0) {
      const updatedTargets = { ...userTargets };
      
      // Recalculate achievements for all users based on converted leads only
      Object.keys(updatedTargets).forEach(userId => {
        const achievements = calculateUserAchievements(userId, leads);
        updatedTargets[userId] = {
          ...updatedTargets[userId],
          salesAchieved: achievements.salesAchieved,
          invoiceAchieved: achievements.invoiceAchieved
        };
      });
      
      setUserTargetsState(updatedTargets);
    }
  }, [leads]);

  useEffect(() => {
    if (authState.isAuthenticated) {
      refreshData();
    }
  }, [authState.isAuthenticated, authState.user?.role]);

  // Clean addLead function - ONLY your fields
  const addLead = async (leadData: Omit<Lead, 'id'>) => {
    try {
      // Send data with your clean field structure
      const backendData = {
        companyRepresentativeName: leadData.companyRepresentativeName,
        companyName: leadData.companyName,
        email: leadData.email,
        phone: leadData.phone || null,
        source: leadData.source,
        pricePaid: Number(leadData.pricePaid) || 0,
        invoiceBilled: Number(leadData.invoiceBilled) || 0,
        status: leadData.status,
        assignedTo: leadData.assignedTo || null,
        brand: leadData.brand || null,
        product: leadData.product || null,
        location: leadData.location || null,
        notes: leadData.notes || null
      };

      console.log('Sending clean lead data to backend:', backendData);
      
      const response = await apiService.createLead(backendData);
      if (response.success) {
        const newLead = response.data;
        setLeads(prev => [...prev, newLead]);
        
        // Only update achievements if the new lead is converted
        if (newLead.assignedTo && newLead.status === 'converted') {
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

  // Clean updateLead function - ONLY your fields
  const updateLead = async (updatedLead: Lead) => {
    try {
      // Send data with your clean field structure
      const backendData = {
        companyRepresentativeName: updatedLead.companyRepresentativeName,
        companyName: updatedLead.companyName,
        email: updatedLead.email,
        phone: updatedLead.phone || null,
        source: updatedLead.source,
        pricePaid: Number(updatedLead.pricePaid) || 0,
        invoiceBilled: Number(updatedLead.invoiceBilled) || 0,
        status: updatedLead.status,
        assignedTo: updatedLead.assignedTo || null,
        brand: updatedLead.brand || null,
        product: updatedLead.product || null,
        location: updatedLead.location || null,
        notes: updatedLead.notes || null
      };

      const response = await apiService.updateLead(updatedLead.id.toString(), backendData);
      if (response.success) {
        const oldLead = leads.find(l => l.id === updatedLead.id);
        const newLeadData = response.data;
        
        setLeads(prev => prev.map(lead => 
          lead.id === updatedLead.id ? newLeadData : lead
        ));
        
        // Update achievements for affected users based on status changes
        const updatedLeads = leads.map(lead => 
          lead.id === updatedLead.id ? newLeadData : lead
        );
        
        // Check if the lead status changed to/from converted or assignment changed
        const statusChanged = oldLead?.status !== newLeadData.status;
        const assignmentChanged = oldLead?.assignedTo !== newLeadData.assignedTo;
        
        if (statusChanged || assignmentChanged) {
          // Update achievements for old assigned user (if any)
          if (oldLead?.assignedTo) {
            const oldAchievements = calculateUserAchievements(oldLead.assignedTo, updatedLeads);
            updateUserTargets(oldLead.assignedTo, oldAchievements);
          }
          
          // Update achievements for new assigned user (if any)
          if (newLeadData.assignedTo) {
            const newAchievements = calculateUserAchievements(newLeadData.assignedTo, updatedLeads);
            updateUserTargets(newLeadData.assignedTo, newAchievements);
          }
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
        
        // Update achievements for assigned user if the deleted lead was converted
        if (leadToDelete?.assignedTo && leadToDelete.status === 'converted') {
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
        
        // Update achievements for all affected users (only for converted leads)
        const affectedUsers = new Set(
          leadsToDelete
            .filter(lead => lead.status === 'converted' && lead.assignedTo)
            .map(lead => lead.assignedTo!)
        );
        const updatedLeads = leads.filter(lead => !ids.includes(lead.id.toString()));
        
        affectedUsers.forEach(userId => {
          const achievements = calculateUserAchievements(userId, updatedLeads);
          updateUserTargets(userId, achievements);
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
        
        // Update achievements for all affected users (only for converted leads)
        const affectedUsers = new Set([
          salesPersonId,
          ...leadsToUpdate
            .filter(lead => lead.status === 'converted' && lead.assignedTo)
            .map(lead => lead.assignedTo!)
        ]);
        
        const updatedLeads = leads.map(lead => 
          ids.includes(lead.id.toString()) 
            ? { ...lead, assignedTo: salesPersonId }
            : lead
        );
        
        affectedUsers.forEach(userId => {
          const achievements = calculateUserAchievements(userId, updatedLeads);
          updateUserTargets(userId, achievements);
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

  // Clean filterLeads function - uses your fields
  const filterLeads = (searchTerm: string, status: string): Lead[] => {
    return leads.filter(lead => {
      const matchesSearch = searchTerm === '' || 
        lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.companyRepresentativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase());
      
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