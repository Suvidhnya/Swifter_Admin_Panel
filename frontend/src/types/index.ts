export type UserRole = 'super_admin' | 'admin' | 'product_manager' | 'support_user';

export interface User {
  id?: string;
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  version: string;
  status: 'active' | 'inactive' | 'archived';
  category: string;
  owner: string;
  features: string[];
  documentation: string;
  launchDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Setting {
  _id: string;
  key: string;
  value: any;
  description: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
