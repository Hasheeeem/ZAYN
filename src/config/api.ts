const API_BASE_URL = 'http://localhost:8000';

const apiConfig = {
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
    targets: {
      list: '/targets',
      create: '/targets',
      get: (userId: string) => `/targets/${userId}`,
      update: (userId: string) => `/targets/${userId}`,
      delete: (userId: string) => `/targets/${userId}`
    },
    calendar: {
      events: '/calendar/events',
      createEvent: '/calendar/events',
      updateEvent: (id: string) => `/calendar/events/${id}`,
      deleteEvent: (id: string) => `/calendar/events/${id}`
    },
    tasks: {
      list: '/tasks',
      create: '/tasks',
      update: (id: string) => `/tasks/${id}`,
      delete: (id: string) => `/tasks/${id}`
    },
    management: {
      get: (type: string) => `/management/${type}`,
      create: (type: string) => `/management/${type}`,
      update: (type: string, id: string) => `/management/${type}/${id}`,
      delete: (type: string, id: string) => `/management/${type}/${id}`
    }
  }
};

export const testApiConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};

export default apiConfig;