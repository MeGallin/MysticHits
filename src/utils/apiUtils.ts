import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  statusCode: number;
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status || 500;
    const message =
      error.response?.data?.message || error.message || 'An error occurred';
    return { message, statusCode };
  }

  return {
    message:
      error instanceof Error ? error.message : 'An unknown error occurred',
    statusCode: 500,
  };
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};
