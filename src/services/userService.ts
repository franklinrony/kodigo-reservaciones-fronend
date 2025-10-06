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

interface LaravelPaginatedUsersResponse {
  users: {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const userService = {
  async getUserById(userId: number): Promise<User> {
    const response = await apiClient.get<LaravelUserResponse>(`/v1/users/${userId}`);
    return extractLaravelData<User>(response, 'user');
  },

  async getBoardUsers(boardId: number): Promise<User[]> {
    const response = await apiClient.get<LaravelUsersResponse>(`/v1/boards/${boardId}/users`);
    return extractLaravelData<User[]>(response, 'users');
  },

  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get<LaravelPaginatedUsersResponse>('/v1/users');
    return response.users.data;
  }
};
