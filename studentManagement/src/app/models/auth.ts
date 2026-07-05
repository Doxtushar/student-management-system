export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success?: boolean;
  valid?: boolean;
  authenticated?: boolean;
  message?: string;
  username?: string;
}
