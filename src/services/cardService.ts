import { apiClient, extractLaravelData } from '@/utils/api';
import {
  Card,
  CreateCardRequest,
  UpdateCardRequest,
  LaravelCardsResponse
} from '@/models';

export const cardService = {
  async getCards(listId: number): Promise<Card[]> {
    const response = await apiClient.get<LaravelCardsResponse>(`/api/v1/lists/${listId}/cards`);
    return extractLaravelData<Card[]>(response, 'cards');
  },

  async getCard(cardId: number): Promise<Card> {
    const response = await apiClient.get<any>(`/api/v1/cards/${cardId}`);
    return extractLaravelData<Card>(response, 'card');
  },

  async createCard(listId: number, cardData: CreateCardRequest): Promise<Card> {
    const response = await apiClient.post<any>(`/api/v1/lists/${listId}/cards`, cardData);
    return extractLaravelData<Card>(response, 'card');
  },

  async updateCard(cardId: number, cardData: UpdateCardRequest): Promise<Card> {
    const response = await apiClient.put<any>(`/api/v1/cards/${cardId}`, cardData);
    return extractLaravelData<Card>(response, 'card');
  },

  async deleteCard(cardId: number): Promise<void> {
    await apiClient.delete(`/api/v1/cards/${cardId}`);
  }
};