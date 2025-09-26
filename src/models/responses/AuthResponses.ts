import type { User } from '../complete';

export interface AuthResponse {
  token: string;
  user: User;
}