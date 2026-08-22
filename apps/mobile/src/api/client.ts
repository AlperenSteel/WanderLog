import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — token eklemek için (Modül 2'de doldurulacak)
apiClient.interceptors.request.use(
  (config) => {
    // TODO: SecureStore'dan token oku ve ekle
    // const token = await SecureStore.getItemAsync('accessToken');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — 401 → token yenileme (Modül 2'de doldurulacak)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // TODO: 401 → refresh token → retry
    return Promise.reject(error);
  },
);
