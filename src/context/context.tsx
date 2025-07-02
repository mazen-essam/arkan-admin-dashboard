// apiContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios, { AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
import { toast } from 'react-hot-toast';

// ==================== TYPES ====================
interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  status?: number;
}

interface AuthData {
  email: string;
  password: string;
}

interface UserData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password?: string;
  password_confirmation?: string;
  role?: string;
  image?: string | File;
  status?: string;
}

interface PropertyData {
  title_en: string;
  title_ar: string;
  price: number;
  price_unit_en: string;
  price_unit_ar: string;
  unit_number?: string;
  rent_amount?: number;
  lease_start?: string;
  lease_end?: string;
  status?: string;
  rooms?: number;
  beds?: number;
  bathrooms?: number;
  land_space?: number;
  is_furnished?: boolean;
  features_en?: string;
  features_ar?: string;
  amenities_en?: string;
  amenities_ar?: string;
  description_en?: string;
  description_ar?: string;
  location_en?: string;
  location_ar?: string;
  coordinates_location?: string;
  phone?: string;
  image?: File | string;
  user_id?: number;
  category_id?: number;
  type_id?: number;
}

interface ServiceData {
  title_en: string;
  title_ar: string;
  price: number;
  price_duration?: string;
  price_unit_en: string;
  price_unit_ar: string;
  description_en?: string;
  description_ar?: string;
  location_en?: string;
  location_ar?: string;
  phone?: string;
  image?: File | string;
  user_id?: number;
  category_id?: number;
}

interface FavoriteData {
  favoritable_id: number;
  favoritable_type: string;
}

interface PostData {
  title: string;
  description: string;
}

interface VisitData {
  name: string;
  phone_number: string;
  visit_date: string;
  visit_time: string;
  property_id: number;
}

interface EmergencyData {
  emergency_type: string;
  status?: string;
  priority?: string;
  property_id: number;
  tenant_id: number;
}
interface PropertyType {
  id: number;
  name_en: string;
  name_ar: string;
}

interface ApiContextType {
  loading: boolean;
  error: string | null;
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string | null) => void;
  api: {
    auth: {
      login: (credentials: AuthData) => Promise<ApiResponse>;
      register: (userData: UserData) => Promise<ApiResponse>;
      logout: () => Promise<ApiResponse>;
      refreshToken: () => Promise<ApiResponse>;
      sendPasswordResetOtp: (email: string) => Promise<ApiResponse>;
      validatePasswordResetOtp: (email: string, otp: string) => Promise<ApiResponse>;
      resetPassword: (email: string, otp: string, password: string, passwordConfirmation: string) => Promise<ApiResponse>;
      sendSmsOtp: (phone_number: string) => Promise<ApiResponse>;
      validateSmsOtp: (phone_number: string, code: string) => Promise<ApiResponse>;
    };
    users: {
      getAll: () => Promise<ApiResponse>;
      getById: (id: string) => Promise<ApiResponse>;
      create: (userData: UserData) => Promise<ApiResponse>;
      update: (id: string, userData: Partial<UserData>) => Promise<ApiResponse>;
      deleteUser: (id: string) => Promise<ApiResponse>;
      getProfile: () => Promise<ApiResponse>;
      updateImage: (imageFile: File) => Promise<ApiResponse>;
    };
    properties: {
      getAll: () => Promise<ApiResponse>;
      getById: (id: string) => Promise<ApiResponse>;
      create: (propertyData: PropertyData) => Promise<ApiResponse>;
      update: (id: string, propertyData: Partial<PropertyData>) => Promise<ApiResponse>;
      delete: (id: string) => Promise<ApiResponse>;
      getByUser: (userId: string) => Promise<ApiResponse>;
    };
    categories: {
      getAll: () => Promise<ApiResponse>;
      getById: (id: string) => Promise<ApiResponse>;
      create: (categoryData: { name_en: string; name_ar: string }) => Promise<ApiResponse>;
      update: (id: string, categoryData: { name_en: string; name_ar: string }) => Promise<ApiResponse>;
      delete: (id: string) => Promise<ApiResponse>;
    };
    services: {
      getAll: () => Promise<ApiResponse>;
      getById: (id: string) => Promise<ApiResponse>;
      create: (serviceData: ServiceData) => Promise<ApiResponse>;
      update: (id: string, serviceData: Partial<ServiceData>) => Promise<ApiResponse>;
      delete: (id: string) => Promise<ApiResponse>;
      getByUser: (userId: string) => Promise<ApiResponse>;
    };
    favorites: {
      getAll: () => Promise<ApiResponse>;
      add: (favoriteData: FavoriteData) => Promise<ApiResponse>;
      remove: (favoriteData: FavoriteData) => Promise<ApiResponse>;
    };
    posts: {
      getAll: () => Promise<ApiResponse>;
      getById: (id: string) => Promise<ApiResponse>;
      create: (postData: PostData) => Promise<ApiResponse>;
      update: (id: string, postData: PostData) => Promise<ApiResponse>;
      delete: (id: string) => Promise<ApiResponse>;
    };
    visits: {
      getAll: () => Promise<ApiResponse>;
      getById: (id: string) => Promise<ApiResponse>;
      create: (visitData: VisitData) => Promise<ApiResponse>;
      delete: (id: string) => Promise<ApiResponse>;
      getByProperty: (propertyId: string) => Promise<ApiResponse>;
    };
    emergencies: {
      getAll: () => Promise<ApiResponse>;
      getById: (id: string) => Promise<ApiResponse>;
      create: (emergencyData: EmergencyData) => Promise<ApiResponse>;
      update: (id: string, emergencyData: EmergencyData) => Promise<ApiResponse>;
      delete: (id: string) => Promise<ApiResponse>;
    };
    types: {
      getAll: () => Promise<ApiResponse<PropertyType[]>>;
      getById: (id: string) => Promise<ApiResponse<PropertyType>>;
      create: (typeData: { name_en: string; name_ar: string }) => Promise<ApiResponse<PropertyType>>;
      update: (id: string, typeData: { name_en: string; name_ar: string }) => Promise<ApiResponse<PropertyType>>;
      delete: (id: string) => Promise<ApiResponse>;
    };
  };
}

// ==================== CONTEXT ====================
const ApiContext = createContext<ApiContextType | null>(null);

// ==================== CONFIG ====================

const API_BASE_URL = 'https://realestate.learnock.com';
const API_HEADERS = {
  'Content-Type': 'application/json',
  'apiKey': '1234'
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: API_HEADERS
});

const API_ENDPOINTS = {
  AUTH: '/api/auth',
  USERS: '/api/user',
  PROPERTIES: '/api/properties',
  CATEGORIES: '/api/properties/categories',
  SERVICE_CATEGORIES: '/api/service-categories',
  SERVICES: '/api/services',
  FAVORITES: '/api/favorites',
  POSTS: '/api/posts',
  VISITS: '/api/property-visits',
  EMERGENCIES: '/api/emergency-requests',
  SMS: '/api/sms',
  PASSWORD_RESET: '/api/password-reset',
  TYPES: '/api/types',
};

// ==================== PROVIDER ====================
export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  // Initialize token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setTokenState(storedToken);
    }
  }, []);

  // Set or remove the Authorization header when token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Exposed setToken function
  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
  };
  const makeRequest = async <T,>(
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    endpoint: string,
    data: any = null,
    customPrefix: string | null = null,
    isFormData: boolean = false,
    tokenOverride: string | null = null,

  ): Promise<ApiResponse<T>> => {
    setLoading(true);
    setError(null);

    try {
      const fullUrl = customPrefix ? `${customPrefix}${endpoint}` : endpoint;

      // Use the most up-to-date token
      const currentToken = tokenOverride ?? token ?? localStorage.getItem('token');
      console.groupCollapsed(`📡 API Request: ${method.toUpperCase()} ${fullUrl}`);
      console.log('🔐 Token exists:', currentToken ? 'YES' : 'NO');

      // 2. Initialize headers
      const headers: Record<string, string> = {
        'apiKey': '1234' // Your static API key
      };

      // 3. Set Content-Type if not FormData
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      // 4. Set Authorization header if token exists
      if (currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`;
        console.log('🔑 Authorization header set');
      } else {
        console.warn('⚠️ No token available for this request');
      }

      const config: AxiosRequestConfig = {
        headers,
        transformRequest: isFormData ? (data) => data : undefined
      };

      // Safe debugging of headers (redacts token)
      console.log('🧾 Request Headers:', {
        ...headers,
        Authorization: headers.Authorization ? `Bearer ${currentToken}` : undefined
      });

      // Debug request data
      if (data) {
        if (isFormData && data instanceof FormData) {
          console.log('📦 FormData contents:');
          for (const [key, value] of data.entries()) {
            console.log(`${key}:`, value);
          }
        } else {
          console.log('📦 Request payload:', data);
        }
      }

      let response: AxiosResponse<ApiResponse<T>>;
      switch (method) {
        case 'get':
          response = await api.get(fullUrl, config);
          break;
        case 'delete':
          response = await api.delete(fullUrl, config);
          break;
        case 'post':
          response = await api.post(fullUrl, data, config);
          break;
        case 'put':
          response = await api.put(fullUrl, data, config);
          break;
        case 'patch':
          response = await api.patch(fullUrl, data, config);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      console.log('✅ Response status:', response.status);
      console.log('📨 Response data:', response.data);
      console.groupEnd();

      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiResponse>;
      console.error('❌ API Error:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        config: error.config
      });

      if (error.response?.status === 401) {
        // Token might be expired - clear it
        setToken(null);
        localStorage.removeItem('token');
        toast.error('Session expired. Please login again.');
      }

      if (error.response) {
        // Server responded with error status
        setError(error.response.data?.message || 'An error occurred');
        toast.error(error.response.data?.message || 'Request failed');
      } else {
        // Network error or request failed to send
        setError(error.message);
        toast.error('Network error - please check your connection');
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };
  // ==================== API METHODS ====================

  // Authentication
  const auth = {
    login: async (credentials: AuthData) => {
      const data = await makeRequest('post', '/login', credentials, API_ENDPOINTS.AUTH);

      console.log('🔐 Login API response:', data);

      const receivedToken = typeof data.data === 'string' ? data.data : null;

      if (receivedToken) {
        console.log('✅ Received token:', receivedToken);
        setToken(receivedToken);
      } else {
        console.warn('⚠️ No token found in login response:', data);
        throw new Error(data.message || 'Login failed: No token returned.');
      }

      return data;
    }
    ,

    register: async (userData: UserData) => {
      return await makeRequest('post', '/register', userData, API_ENDPOINTS.AUTH);
    },

    logout: async () => {
      try {
        const data = await makeRequest('post', '/logout', null, API_ENDPOINTS.AUTH);
        setToken(null);
        console.log('👋 Logged out and token cleared.');
        return data;
      } catch (err) {
        console.error('❌ Logout error:', err.message || err);
        throw err;
      }
    },

    refreshToken: async () => {
      const data = await makeRequest('post', '/refresh', null, API_ENDPOINTS.AUTH);
      const newToken = (data.data as any)?.access_token;

      if (newToken) {
        console.log('🔁 Refreshed token:', newToken);
        setToken(newToken);
      } else {
        console.warn('⚠️ No access token returned from refresh:', data);
      }

      return data;
    },

    sendPasswordResetOtp: async (email: string) => {
      return await makeRequest('post', '/otp-mail', { email }, API_ENDPOINTS.PASSWORD_RESET);
    },

    validatePasswordResetOtp: async (email: string, otp: string) => {
      return await makeRequest('post', '/validate-otp', { email, otp }, API_ENDPOINTS.PASSWORD_RESET);
    },

    resetPassword: async (email: string, otp: string, password: string, passwordConfirmation: string) => {
      return await makeRequest('post', '/reset-password', {
        email,
        otp,
        password,
        password_confirmation: passwordConfirmation
      }, API_ENDPOINTS.PASSWORD_RESET);
    },

    sendSmsOtp: async (phone_number: string) => {
      return await makeRequest('post', '/send', { phone_number }, API_ENDPOINTS.SMS);
    },

    validateSmsOtp: async (phone_number: string, code: string) => {
      return await makeRequest('post', '/validate-otp', { phone_number, code }, API_ENDPOINTS.SMS);
    }
  };

  // Users
  const users = {
    getAll: async () => await makeRequest('get', '', null, API_ENDPOINTS.USERS),
    getById: async (id: string) => await makeRequest('get', `/${id}`, null, API_ENDPOINTS.USERS),
    create: async (userData: UserData) => await makeRequest('post', '', userData, API_ENDPOINTS.USERS),
    update: async (id: string, userData: Partial<UserData>) =>
      await makeRequest('put', `/${id}`, userData, API_ENDPOINTS.USERS),
    deleteUser: async (id: string) => await makeRequest('delete', `/${id}`, null, API_ENDPOINTS.USERS),
    getProfile: async () => await makeRequest('get', '/profile', null, API_ENDPOINTS.USERS),
    updateImage: async (imageFile: File) => {
      const formData = new FormData();
      formData.append('image', imageFile);
      return await makeRequest('post', '/update-image', formData, API_ENDPOINTS.USERS, true);
    }
  };

  // Helper function to create FormData
  const createFormData = (data: any) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value); // ✅ real file
        } else if (
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean'
        ) {
          formData.append(key, String(value)); // ✅ stringified primitive
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value)); // for nested objects
        }
      }
    });

    return formData;
  };

  // Properties
  const properties = {
    getAll: async () => await makeRequest('get', '', null, API_ENDPOINTS.PROPERTIES),
    getById: async (id: string) => await makeRequest('get', `/${id}`, null, API_ENDPOINTS.PROPERTIES),
    create: async (propertyData: PropertyData) => {
      const formData = createFormData(propertyData);
      return await makeRequest('post', '', formData, API_ENDPOINTS.PROPERTIES, true);
    },
    update: async (id: string, propertyData: Partial<PropertyData>) => {
      const formData = createFormData(propertyData);
      return await makeRequest('put', `/${id}`, formData, API_ENDPOINTS.PROPERTIES, true);
    },
    delete: async (id: string) => await makeRequest('delete', `/${id}`, null, API_ENDPOINTS.PROPERTIES),
    getByUser: async (userId: string) => await makeRequest('get', `/user/${userId}`, null, API_ENDPOINTS.PROPERTIES)
  };

  // Categories
  const categories = {
    getAll: async () => await makeRequest('get', '', null, API_ENDPOINTS.CATEGORIES),
    getById: async (id: string) => await makeRequest('get', `/${id}`, null, API_ENDPOINTS.CATEGORIES),
    create: async (categoryData: { name_en: string; name_ar: string }) =>
      await makeRequest('post', '', categoryData, API_ENDPOINTS.CATEGORIES),
    update: async (id: string, categoryData: { name_en: string; name_ar: string }) =>
      await makeRequest('put', `/${id}`, categoryData, API_ENDPOINTS.CATEGORIES),
    delete: async (id: string) => await makeRequest('delete', `/${id}`, null, API_ENDPOINTS.CATEGORIES)
  };
  const types = {
    getAll: async () => await makeRequest<PropertyType[]>('get', '', null, API_ENDPOINTS.TYPES),
    getById: async (id: string) => await makeRequest<PropertyType>('get', `/${id}`, null, API_ENDPOINTS.TYPES),
    create: async (typeData: { name_en: string; name_ar: string }) =>
      await makeRequest<PropertyType>('post', '', typeData, API_ENDPOINTS.TYPES),
    update: async (id: string, typeData: { name_en: string; name_ar: string }) =>
      await makeRequest<PropertyType>('put', `/${id}`, typeData, API_ENDPOINTS.TYPES),
    delete: async (id: string) =>
      await makeRequest('delete', `/${id}`, null, API_ENDPOINTS.TYPES)
  };

  // Services
  const services = {
    getAll: async () => await makeRequest('get', '', null, API_ENDPOINTS.SERVICES),
    getById: async (id: string) => await makeRequest('get', `/${id}`, null, API_ENDPOINTS.SERVICES),
    create: async (serviceData: ServiceData) => {
      const formData = createFormData(serviceData);
      return await makeRequest('post', '', formData, API_ENDPOINTS.SERVICES, true);
    },
    update: async (id: string, serviceData: Partial<ServiceData>) => {
      const formData = createFormData(serviceData);
      return await makeRequest('put', `/${id}`, formData, API_ENDPOINTS.SERVICES, true);
    },
    delete: async (id: string) => await makeRequest('delete', `/${id}`, null, API_ENDPOINTS.SERVICES),
    getByUser: async (userId: string) => await makeRequest('get', `/user/${userId}`, null, API_ENDPOINTS.SERVICES)
  };

  // Favorites
  const favorites = {
    getAll: async () => await makeRequest('get', '', null, API_ENDPOINTS.FAVORITES),
    add: async (favoriteData: FavoriteData) =>
      await makeRequest('post', '/add', favoriteData, API_ENDPOINTS.FAVORITES),
    remove: async (favoriteData: FavoriteData) =>
      await makeRequest('post', '/delete', favoriteData, API_ENDPOINTS.FAVORITES)
  };

  // Posts
  const posts = {
    getAll: async () => await makeRequest('get', '', null, API_ENDPOINTS.POSTS),
    getById: async (id: string) => await makeRequest('get', `/${id}`, null, API_ENDPOINTS.POSTS),
    create: async (postData: PostData) => await makeRequest('post', '', postData, API_ENDPOINTS.POSTS),
    update: async (id: string, postData: PostData) =>
      await makeRequest('put', `/${id}`, postData, API_ENDPOINTS.POSTS),
    delete: async (id: string) => await makeRequest('delete', `/${id}`, null, API_ENDPOINTS.POSTS)
  };

  // Visits
  const visits = {
    getAll: async () => await makeRequest('get', '', null, API_ENDPOINTS.VISITS),
    getById: async (id: string) => await makeRequest('get', `/${id}`, null, API_ENDPOINTS.VISITS),
    create: async (visitData: VisitData) => await makeRequest('post', '', visitData, API_ENDPOINTS.VISITS),
    delete: async (id: string) => await makeRequest('delete', `/${id}`, null, API_ENDPOINTS.VISITS),
    getByProperty: async (propertyId: string) =>
      await makeRequest('get', `/property/${propertyId}`, null, API_ENDPOINTS.VISITS)
  };

  // Emergencies
  const emergencies = {
    getAll: async () => await makeRequest('get', '', null, API_ENDPOINTS.EMERGENCIES),
    getById: async (id: string) => await makeRequest('get', `/${id}`, null, API_ENDPOINTS.EMERGENCIES),
    create: async (emergencyData: EmergencyData) =>
      await makeRequest('post', '', emergencyData, API_ENDPOINTS.EMERGENCIES),
    update: async (id: string, emergencyData: EmergencyData) =>
      await makeRequest('put', `/${id}`, emergencyData, API_ENDPOINTS.EMERGENCIES),
    delete: async (id: string) => await makeRequest('delete', `/${id}`, null, API_ENDPOINTS.EMERGENCIES)
  };

  // ==================== CONTEXT VALUE ====================
  const value: ApiContextType = {
    loading,
    error,
    token,
    isAuthenticated: !!token,
    setToken,
    api: {
      auth,
      users,
      properties,
      categories,
      services,
      favorites,
      posts,
      visits,
      emergencies,
      types
    }
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

// ==================== HOOK ====================
export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};