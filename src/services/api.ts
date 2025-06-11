import apiConfig from '../config/api';

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
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
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

  // Auth methods
  async login(email: string, password: string) {
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