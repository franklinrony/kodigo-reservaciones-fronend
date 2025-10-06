import { apiClient, extractLaravelData } from '@/utils/api';
import {
  Label,
  CreateLabelRequest,
  LaravelLabelsResponse
} from '@/models';

export const labelService = {
  async getAllLabels(): Promise<Label[]> {
    const response = await apiClient.get<LaravelLabelsResponse>('/v1/labels');
    return extractLaravelData<Label[]>(response, 'labels');
  },

  async getLabels(boardId: number): Promise<Label[]> {
    const response = await apiClient.get<LaravelLabelsResponse>(`/v1/boards/${boardId}/labels`);
    return extractLaravelData<Label[]>(response, 'labels');
  },

  async getLabel(labelId: number): Promise<Label> {
    const response = await apiClient.get<import('@/models').LaravelResponse<Label>>(`/v1/labels/${labelId}`);
    return extractLaravelData<Label>(response, 'label');
  },

  async createLabel(boardId: number, labelData: CreateLabelRequest): Promise<Label> {
    const response = await apiClient.post<import('@/models').LaravelResponse<Label>>(`/v1/boards/${boardId}/labels`, labelData);
    return extractLaravelData<Label>(response, 'label');
  },

  async updateLabel(labelId: number, labelData: Partial<CreateLabelRequest>): Promise<Label> {
    const response = await apiClient.put<import('@/models').LaravelResponse<Label>>(`/v1/labels/${labelId}`, labelData);
    return extractLaravelData<Label>(response, 'label');
  },

  async deleteLabel(labelId: number): Promise<void> {
    await apiClient.delete(`/v1/labels/${labelId}`);
  }
};
