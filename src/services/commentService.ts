import { apiClient, extractLaravelData } from '@/utils/api';
import {
  Comment,
  CreateCommentRequest,
  LaravelCommentsResponse
} from '@/models';

export const commentService = {
  async getComments(cardId: number): Promise<Comment[]> {
    const response = await apiClient.get<LaravelCommentsResponse>(`/api/v1/cards/${cardId}/comments`);
    return extractLaravelData<Comment[]>(response, 'comments');
  },

  async getComment(commentId: number): Promise<Comment> {
    const response = await apiClient.get<any>(`/api/v1/comments/${commentId}`);
    return extractLaravelData<Comment>(response, 'comment');
  },

  async createComment(cardId: number, commentData: CreateCommentRequest): Promise<Comment> {
    const response = await apiClient.post<any>(`/api/v1/cards/${cardId}/comments`, commentData);
    return extractLaravelData<Comment>(response, 'comment');
  },

  async updateComment(commentId: number, commentData: CreateCommentRequest): Promise<Comment> {
    const response = await apiClient.put<any>(`/api/v1/comments/${commentId}`, commentData);
    return extractLaravelData<Comment>(response, 'comment');
  },

  async deleteComment(commentId: number): Promise<void> {
    await apiClient.delete(`/api/v1/comments/${commentId}`);
  }
};