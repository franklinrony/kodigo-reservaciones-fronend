import { apiClient, extractLaravelData } from '@/utils/api';
import {
  BoardList,
  CreateListRequest,
  LaravelListsResponse
} from '@/models';

export const listService = {
  async getLists(boardId: number): Promise<BoardList[]> {
    const response = await apiClient.get<LaravelListsResponse>(`/api/v1/boards/${boardId}/lists`);
    return extractLaravelData<BoardList[]>(response, 'lists');
  },

  async getList(boardId: number, listId: number): Promise<BoardList> {
    const response = await apiClient.get<any>(`/api/v1/boards/${boardId}/lists/${listId}`);
    return extractLaravelData<BoardList>(response, 'list');
  },

  async createList(boardId: number, listData: CreateListRequest): Promise<BoardList> {
    const response = await apiClient.post<any>(`/api/v1/boards/${boardId}/lists`, listData);
    return extractLaravelData<BoardList>(response, 'list');
  },

  async updateList(boardId: number, listId: number, listData: Partial<CreateListRequest>): Promise<BoardList> {
    const response = await apiClient.put<any>(`/api/v1/boards/${boardId}/lists/${listId}`, listData);
    return extractLaravelData<BoardList>(response, 'list');
  },

  async deleteList(boardId: number, listId: number): Promise<void> {
    await apiClient.delete(`/api/v1/boards/${boardId}/lists/${listId}`);
  }
};