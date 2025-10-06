import { apiClient, extractLaravelData } from '@/utils/api';
import {
  Card,
  CreateCardRequest,
  UpdateCardRequest,
  LaravelCardsResponse
} from '@/models';

interface LaravelCardResponse {
  message: string;
  card: Card;
}

export const cardService = {
  async getCards(listId: number): Promise<Card[]> {
    try {
      const response = await apiClient.get<LaravelCardsResponse>(`/v1/lists/${listId}/cards`);
      return extractLaravelData<Card[]>(response, 'cards');
    } catch (error) {
      console.error('Error getting cards:', error);
      // Verificar si es el error específico del backend sobre board null
      if (error instanceof Error && (error.message.includes('board') || error.message.includes('null'))) {
        console.warn('Backend error: Cannot access list cards (board is null). This is a backend data consistency issue.');
        throw new Error('Error: No se pueden cargar las tarjetas. Por favor, recarga la página.');
      }
      throw new Error('Error al obtener las tarjetas');
    }
  },

  async getCard(cardId: number): Promise<Card> {
    try {
      const response = await apiClient.get<LaravelCardResponse>(`/v1/cards/${cardId}`);
      return extractLaravelData<Card>(response, 'card');
    } catch (error) {
      console.error('Error getting card:', error);
      // Verificar si es el error específico del backend sobre board null
      if (error instanceof Error && (error.message.includes('board') || error.message.includes('null'))) {
        console.warn('Backend error: Cannot access specific card (board is null). This is a backend data consistency issue.');
        throw new Error('Error: No se puede acceder a la tarjeta. Por favor, recarga la página.');
      }
      throw new Error('Error al obtener la tarjeta');
    }
  },

  async createCard(listId: number, cardData: CreateCardRequest): Promise<Card> {
    try {
      const response = await apiClient.post<LaravelCardResponse>(`/v1/lists/${listId}/cards`, cardData);
      return extractLaravelData<Card>(response, 'card');
    } catch (error) {
      console.error('Error creating card:', error);
      // Verificar si es el error específico del backend sobre board null
      if (error instanceof Error && (error.message.includes('board') || error.message.includes('null'))) {
        console.warn('Backend error: Cannot create card (board is null). This is a backend data consistency issue.');
        throw new Error('Error: No se puede crear la tarjeta. El tablero no está disponible.');
      }
      throw new Error('Error al crear la tarjeta');
    }
  },

  async updateCard(cardId: number, cardData: UpdateCardRequest): Promise<Card> {
    try {
      const response = await apiClient.put<LaravelCardResponse>(`/v1/cards/${cardId}`, cardData);
      return extractLaravelData<Card>(response, 'card');
    } catch (error) {
      console.error('Error updating card:', error);
      // Verificar si es el error específico del backend sobre board null
      if (error instanceof Error && (error.message.includes('board') || error.message.includes('null'))) {
        console.warn('Backend error: Card cannot access board (board is null). This is a backend data consistency issue.');
        throw new Error('Error: La tarjeta no tiene acceso al tablero. Por favor, recarga la página.');
      }
      throw new Error('Error al actualizar la tarjeta');
    }
  },

  async deleteCard(cardId: number): Promise<void> {
    try {
      await apiClient.delete(`/v1/cards/${cardId}`);
    } catch (error) {
      console.error('Error deleting card:', error);
      // Verificar si es el error específico del backend sobre board null
      if (error instanceof Error && (error.message.includes('board') || error.message.includes('null'))) {
        console.warn('Backend error: Cannot delete card (board is null). This is a backend data consistency issue.');
        throw new Error('Error: No se puede eliminar la tarjeta. El tablero no está disponible.');
      }
      throw new Error('Error al eliminar la tarjeta');
    }
  }
};
