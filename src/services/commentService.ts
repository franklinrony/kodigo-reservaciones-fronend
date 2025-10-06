import { apiClient, extractLaravelData } from '@/utils/api';
import {
  Comment,
  CreateCommentRequest,
  LaravelCommentsResponse
} from '@/models';

export const commentService = {
  async getComments(cardId: number): Promise<Comment[]> {
    const response = await apiClient.get<LaravelCommentsResponse>(`/v1/cards/${cardId}/comments`);
    return extractLaravelData<Comment[]>(response, 'comments');
  },

  async getComment(commentId: number): Promise<Comment> {
    const response = await apiClient.get<import('@/models').LaravelResponse<Comment>>(` /v1/comments/${commentId}`.trim());
    return extractLaravelData<Comment>(response, 'comment');
  },

  async createComment(cardId: number, commentData: CreateCommentRequest): Promise<Comment> {
    const response = await apiClient.post<import('@/models').LaravelResponse<Comment>>(`/v1/cards/${cardId}/comments`, commentData);
    return extractLaravelData<Comment>(response, 'comment');
  },

  async updateComment(commentId: number, commentData: CreateCommentRequest): Promise<Comment> {
    const response = await apiClient.put<import('@/models').LaravelResponse<Comment>>(`/v1/comments/${commentId}`, commentData);
    return extractLaravelData<Comment>(response, 'comment');
  },

  async deleteComment(commentId: number): Promise<void> {
    await apiClient.delete(`/v1/comments/${commentId}`);
  }
};
