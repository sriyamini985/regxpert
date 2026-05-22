export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export interface TrustSignal {
  id: number;
  icon: string;
  label: string;
  description: string;
}

export interface MockCredentials {
  email: string;
  password: string;
  role: string;
}