import apiConfig, { testApiConnection } from '../config/api';

interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = apiConfig.baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      console.log(`Making API request to: ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`API response status: ${response.status}`);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
          // If we can't parse the error response, use the default message
        }

        // Handle specific HTTP status codes
        if (response.status === 401) {
          this.clearToken();
          throw new Error(errorMessage || 'Authentication failed');
        } else if (response.status === 403) {
          throw new Error(errorMessage || 'Access forbidden - Admin rights required');
        } else if (response.status === 423) {
          throw new Error(errorMessage || 'Account locked');
        } else {
          throw new Error(errorMessage);
        }
      }

      const data = await response.json();
      console.log('API response data:', data);
      
      return data;
    } catch (error: any) {
      console.error('API request failed:', error);
      
      // Re-throw with more specific error messages
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Unable to connect to server. Please ensure the backend is running on http://localhost:8000');
      }
      
      throw error;
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    return testApiConnection();
  }

  // Auth methods
  async login(email: string, password: string) {
    console.log('Attempting login with:', { email, password: '***' });
    
    const response = await this.request<{ access_token: string; user: any }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    
    if (response.success && response.data.access_token) {
      this.setToken(response.data.access_token);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } finally {
      this.clearToken();
    }
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Clean Lead methods - ONLY your fields
  async getLeads(params?: Record<string, any>) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const endpoint = queryString ? `/leads?${queryString}` : '/leads';
    return this.request(endpoint);
  }

  async createLead(leadData: any) {
    // Ensure we're sending clean data structure
    const cleanLeadData = {
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

    console.log('Sending clean lead data to API:', cleanLeadData);
    
    return this.request('/leads', {
      method: 'POST',
      body: JSON.stringify(cleanLeadData),
    });
  }

  async updateLead(id: string, leadData: any) {
    // Ensure we're sending clean data structure
    const cleanLeadData = {
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

    console.log('Sending clean lead update data to API:', cleanLeadData);
    
    return this.request(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cleanLeadData),
    });
  }

  async deleteLead(id: string) {
    return this.request(`/leads/${id}`, {
      method: 'DELETE',
    });
  }

  async bulkDeleteLeads(ids: string[]) {
    return this.request('/leads/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  async bulkAssignLeads(ids: string[], salesPersonId: string) {
    return this.request('/leads/bulk-assign', {
      method: 'POST',
      body: JSON.stringify({ ids, salesPersonId }),
    });
  }

  // User methods
  async getUsers() {
    return this.request('/users');
  }

  async createUser(userData: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Salespeople methods
  async getSalespeople() {
    return this.request('/salespeople');
  }

  // Target methods
  async getAllTargets() {
    return this.request('/targets');
  }

  async getUserTargets(userId: string) {
    return this.request(`/targets/${userId}`);
  }

  async createOrUpdateTargets(targetData: any) {
    return this.request('/targets', {
      method: 'POST',
      body: JSON.stringify(targetData),
    });
  }

  async updateTargets(userId: string, targetData: any) {
    return this.request(`/targets/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(targetData),
    });
  }

  async deleteTargets(userId: string) {
    return this.request(`/targets/${userId}`, {
      method: 'DELETE',
    });
  }

  // Calendar Events methods
  async getCalendarEvents() {
    return this.request('/calendar/events');
  }

  async createCalendarEvent(eventData: any) {
    return this.request('/calendar/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateCalendarEvent(id: string, eventData: any) {
    return this.request(`/calendar/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteCalendarEvent(id: string) {
    return this.request(`/calendar/events/${id}`, {
      method: 'DELETE',
    });
  }

  // Tasks methods
  async getTasks() {
    return this.request('/tasks');
  }

  async createTask(taskData: any) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(id: string, taskData: any) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(id: string) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Management methods
  async getManagementData(type: string) {
    return this.request(`/management/${type}`);
  }

  async createManagementItem(type: string, data: any) {
    return this.request(`/management/${type}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateManagementItem(type: string, id: string, data: any) {
    return this.request(`/management/${type}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteManagementItem(type: string, id: string) {
    return this.request(`/management/${type}/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
export default apiService;