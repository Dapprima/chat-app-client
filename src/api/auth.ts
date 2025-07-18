import { API_ROUTES } from '@/constants/api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  _id: string;
  username: string;
  email: string;
  token: string;
}

export const loginUser = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await fetch(API_ROUTES.LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return data;
};

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export const registerUser = async (payload: RegisterPayload): Promise<LoginResponse> => {
  const response = await fetch(API_ROUTES.REGISTER, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }

  return data;
};
