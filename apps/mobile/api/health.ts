import { apiClient } from './client';

export async function fetchHealth() {
  const res = await apiClient.get<{
    data: {
      status: 'ok' | 'degraded';
      services: { database: 'ok' | 'error'; redis: 'ok' | 'error' };
    };
  }>('/health');
  return res.data.data;
}
