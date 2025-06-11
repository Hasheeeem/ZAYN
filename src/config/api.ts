const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      me: '/auth/me'
    },
    leads: {
      list: '/leads',
      create: '/leads',
      update: (id: string) => `/leads/${id}`,
      delete: (id: string) => `/leads/${id}`,
      bulkDelete: '/leads/bulk-delete',
      bulkAssign: '/leads/bulk-assign'
    },
    users: {
      list: '/users',
      create: '/users',
      update: (id: string) => `/users/${id}`,
      delete: (id: string) => `/users/${id}`
    },
    salespeople: {
      list: '/salespeople'
    },
    management: {
      brands: '/management/brands',
      products: '/management/products',
      locations: '/management/locations',
      statuses: '/management/statuses',
      sources: '/management/sources',
      ownership: '/management/ownership'
    }
  }
};

export default apiConfig;