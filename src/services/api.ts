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
      apiConfig.endpoints.auth.login,
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
      await this.request(apiConfig.endpoints.auth.logout, {
        method: 'POST',
      });
    } finally {
      this.clearToken();
    }
  }

  async getCurrentUser() {
    return this.request(apiConfig.endpoints.auth.me);
  }

  // Lead methods
  async getLeads(params?: Record<string, any>) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const endpoint = queryString ? `${apiConfig.endpoints.leads.list}?${queryString}` : apiConfig.endpoints.leads.list;
    return this.request(endpoint);
  }

  async createLead(leadData: any) {
    return this.request(apiConfig.endpoints.leads.create, {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  }

  async updateLead(id: string, leadData: any) {
    return this.request(apiConfig.endpoints.leads.update(id), {
      method: 'PUT',
      body: JSON.stringify(leadData),
    });
  }

  async deleteLead(id: string) {
    return this.request(apiConfig.endpoints.leads.delete(id), {
      method: 'DELETE',
    });
  }

  async bulkDeleteLeads(ids: string[]) {
    return this.request(apiConfig.endpoints.leads.bulkDelete, {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  async bulkAssignLeads(ids: string[], salesPersonId: string) {
    return this.request(apiConfig.endpoints.leads.bulkAssign, {
      method: 'POST',
      body: JSON.stringify({ ids, salesPersonId }),
    });
  }

  // User methods
  async getUsers() {
    return this.request(apiConfig.endpoints.users.list);
  }

  async createUser(userData: any) {
    return this.request(apiConfig.endpoints.users.create, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: any) {
    return this.request(apiConfig.endpoints.users.update(id), {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string) {
    return this.request(apiConfig.endpoints.users.delete(id), {
      method: 'DELETE',
    });
  }

  // Salespeople methods
  async getSalespeople() {
    return this.request(apiConfig.endpoints.salespeople.list);
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