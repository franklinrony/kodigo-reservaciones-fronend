import { apiClient, extractLaravelData } from '@/utils/api';
import {
  Board,
  CreateBoardRequest,
  LaravelBoardsResponse,
  BoardCollaborator
} from '@/models';

interface LaravelCollaboratorsResponse {
  message: string;
  collaborators: BoardCollaborator[];
}

export const boardService = {
  async getBoards(): Promise<Board[]> {
    console.log('boardService.getBoards - Haciendo llamada a /api/v1/boards...');
    const response = await apiClient.get<LaravelBoardsResponse>('/api/v1/boards');
    console.log('boardService.getBoards - Respuesta completa:', response);
    
    try {
      const boards = extractLaravelData<Board[]>(response, 'boards');
      console.log('boardService.getBoards - ✅ Extraídos', boards.length, 'tableros');
      return boards;
    } catch (error) {
      console.error('boardService.getBoards - ❌ Error extrayendo tableros:', error);
      return [];
    }
  },

  async getBoardById(id: string): Promise<Board> {
    const response = await apiClient.get<any>(`/api/v1/boards/${id}`);
    return extractLaravelData<Board>(response, 'board');
  },

  async createBoard(boardData: CreateBoardRequest): Promise<Board> {
    const response = await apiClient.post<any>('/api/v1/boards', boardData);
    return extractLaravelData<Board>(response, 'board');
  },

  async updateBoard(id: string, boardData: Partial<CreateBoardRequest>): Promise<Board> {
    const response = await apiClient.put<any>(`/api/v1/boards/${id}`, boardData);
    return extractLaravelData<Board>(response, 'board');
  },

  async deleteBoard(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/boards/${id}`);
  },

  async addCollaborator(boardId: string, userId: string, role: string = 'member'): Promise<BoardCollaborator> {
    const response = await apiClient.post<any>(
      `/api/v1/boards/${boardId}/collaborators`,
      { user_id: userId, role }
    );
    return extractLaravelData<BoardCollaborator>(response, 'collaborator');
  },

  async updateCollaborator(boardId: string, collaboratorId: string, role: string): Promise<BoardCollaborator> {
    const response = await apiClient.put<any>(
      `/api/v1/boards/${boardId}/collaborators/${collaboratorId}`,
      { role }
    );
    return extractLaravelData<BoardCollaborator>(response, 'collaborator');
  },

  async removeCollaborator(boardId: number, userId: number): Promise<void> {
    await apiClient.delete(`/api/v1/boards/${boardId}/collaborators/${userId}`);
  },

  async getCollaborators(boardId: string): Promise<BoardCollaborator[]> {
    const response = await apiClient.get<LaravelCollaboratorsResponse>(`/api/v1/boards/${boardId}/collaborators`);
    return extractLaravelData<BoardCollaborator[]>(response, 'collaborators');
  }
};