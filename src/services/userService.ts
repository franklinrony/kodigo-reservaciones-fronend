import { apiClient, extractLaravelData } from '@/utils/api';
import { User } from '@/models';

interface LaravelUserResponse {
  message: string;
  user: User;
}

interface LaravelUsersResponse {
  message: string;
  users: User[];
}

export const userService = {
  async getUserById(userId: number): Promise<User> {
    const response = await apiClient.get<LaravelUserResponse>(`/api/v1/users/${userId}`);
    return extractLaravelData<User>(response, 'user');
  },

  async getBoardUsers(boardId: number): Promise<User[]> {
    const response = await apiClient.get<LaravelUsersResponse>(`/api/v1/boards/${boardId}/users`);
    return extractLaravelData<User[]>(response, 'users');
  },

  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get<LaravelUsersResponse>('/api/v1/users');
    return extractLaravelData<User[]>(response, 'users');
  }
};