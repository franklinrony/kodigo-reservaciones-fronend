import { apiClient, extractLaravelData } from '@/utils/api';
import {
  Board,
  CreateBoardRequest,
  LaravelBoardsResponse,
  BoardCollaborator
} from '@/models';

export const boardService = {
  async getBoards(): Promise<Board[]> {
    const response = await apiClient.get<LaravelBoardsResponse>('/v1/boards');

    try {
      const boards = extractLaravelData<Board[]>(response, 'boards');
      return boards;
    } catch (error) {
      console.error('boardService.getBoards - Error extrayendo tableros:', error);
      return [];
    }
  },

  async getBoardById(id: string): Promise<Board> {
    const response = await apiClient.get<import('@/models').LaravelResponse<Board>>(`/v1/boards/${id}`);
    return extractLaravelData<Board>(response, 'board');
  },

  async createBoard(boardData: CreateBoardRequest): Promise<Board> {
    const response = await apiClient.post<import('@/models').LaravelResponse<Board>>('/v1/boards', boardData);
    return extractLaravelData<Board>(response, 'board');
  },

  async updateBoard(id: string, boardData: Partial<CreateBoardRequest>): Promise<Board> {
    const response = await apiClient.put<import('@/models').LaravelResponse<Board>>(`/v1/boards/${id}`, boardData);
    return extractLaravelData<Board>(response, 'board');
  },

  async deleteBoard(id: string): Promise<void> {
    await apiClient.delete(`/v1/boards/${id}`);
  },

  async addCollaborator(boardId: string, userId: string, role: string = 'member'): Promise<void> {
    await apiClient.post(
      `/v1/boards/${boardId}/collaborators`,
      { user_id: userId, role }
    );
    // Note: API saves data but doesn't return collaborator object in expected format
  },

  async updateCollaborator(boardId: string, collaboratorId: string, role: string): Promise<void> {
    await apiClient.put(
      `/v1/boards/${boardId}/collaborators/${collaboratorId}`,
      { role }
    );
    // Note: API updates data but doesn't return collaborator object in expected format
  },

  async removeCollaborator(boardId: number, userId: number): Promise<void> {
    await apiClient.delete(`/v1/boards/${boardId}/collaborators/${userId}`);
  },

  async getCollaborators(boardId: string): Promise<BoardCollaborator[]> {
    const response = await apiClient.get<import('@/models').LaravelCollaboratorsResponse>(`/v1/boards/${boardId}/collaborators`);
    return extractLaravelData<BoardCollaborator[]>(response, 'collaborators');
  }
};
