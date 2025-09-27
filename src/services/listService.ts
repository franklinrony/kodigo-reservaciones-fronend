import { apiClient, extractLaravelData } from '@/utils/api';
import {
  BoardList,
  CreateListRequest,
  LaravelListsResponse
} from '@/models';

interface LaravelListResponse {
  message: string;
  list: BoardList;
}

export const listService = {
  async getLists(boardId: number): Promise<BoardList[]> {
    try {
      const response = await apiClient.get<LaravelListsResponse>(`/api/v1/boards/${boardId}/lists`);
      return extractLaravelData<BoardList[]>(response, 'lists');
    } catch (error) {
      console.error('Error getting lists:', error);
      // Verificar si es el error específico del backend sobre board null
      if (error instanceof Error && (error.message.includes('board') || error.message.includes('null'))) {
        console.warn('Backend error: Cannot access board lists (board is null). This is a backend data consistency issue.');
        throw new Error('Error: No se pueden cargar las listas del tablero. Por favor, recarga la página.');
      }
      throw new Error('Error al obtener las listas');
    }
  },

  async getList(boardId: number, listId: number): Promise<BoardList> {
    try {
      const response = await apiClient.get<LaravelListResponse>(`/api/v1/boards/${boardId}/lists/${listId}`);
      return extractLaravelData<BoardList>(response, 'list');
    } catch (error) {
      console.error('Error getting list:', error);
      // Verificar si es el error específico del backend sobre board null
      if (error instanceof Error && (error.message.includes('board') || error.message.includes('null'))) {
        console.warn('Backend error: Cannot access specific list (board is null). This is a backend data consistency issue.');
        throw new Error('Error: No se puede acceder a la lista. Por favor, recarga la página.');
      }
      throw new Error('Error al obtener la lista');
    }
  },

  async createList(boardId: number, listData: CreateListRequest): Promise<BoardList> {
    try {
      const response = await apiClient.post<LaravelListResponse>(`/api/v1/boards/${boardId}/lists`, listData);
      return extractLaravelData<BoardList>(response, 'list');
    } catch (error) {
      console.error('Error creating list:', error);
      // Verificar si es el error específico del backend sobre board null
      if (error instanceof Error && (error.message.includes('board') || error.message.includes('null'))) {
        console.warn('Backend error: Cannot create list (board is null). This is a backend data consistency issue.');
        throw new Error('Error: No se puede crear la lista. El tablero no está disponible.');
      }
      throw new Error('Error al crear la lista');
    }
  },

  async updateList(boardId: number, listId: number, listData: Partial<CreateListRequest>): Promise<BoardList> {
    try {
      const response = await apiClient.put<LaravelListResponse>(`/api/v1/boards/${boardId}/lists/${listId}`, listData);
      return extractLaravelData<BoardList>(response, 'list');
    } catch (error) {
      console.error('Error updating list:', error);
      // Verificar si es el error específico del backend sobre board null
      if (error instanceof Error && (error.message.includes('board') || error.message.includes('null'))) {
        console.warn('Backend error: Cannot update list (board is null). This is a backend data consistency issue.');
        throw new Error('Error: La lista no tiene acceso al tablero. Por favor, recarga la página.');
      }
      throw new Error('Error al actualizar la lista');
    }
  },

  async deleteList(boardId: number, listId: number): Promise<void> {
    try {
      await apiClient.delete(`/api/v1/boards/${boardId}/lists/${listId}`);
    } catch (error) {
      console.error('Error deleting list:', error);
      // Verificar si es el error específico del backend sobre board null
      if (error instanceof Error && (error.message.includes('board') || error.message.includes('null'))) {
        console.warn('Backend error: Cannot delete list (board is null). This is a backend data consistency issue.');
        throw new Error('Error: No se puede eliminar la lista. El tablero no está disponible.');
      }
      throw new Error('Error al eliminar la lista');
    }
  }
};