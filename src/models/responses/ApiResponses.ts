export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

// Respuestas específicas de Laravel con wrappers personalizados
export interface LaravelResponse<T> {
  message: string;
  data?: T;
}

export interface LaravelBoardsResponse {
  message: string;
  boards: import('../complete').Board[];
}

export interface LaravelUserResponse {
  message: string;
  user: import('../complete').User;
}

export interface LaravelListsResponse {
  message: string;
  lists: import('../complete').BoardList[];
}

export interface LaravelCardsResponse {
  message: string;
  cards: import('../complete').Card[];
}

export interface LaravelLabelsResponse {
  message: string;
  labels: import('../complete').Label[];
}

export interface LaravelCommentsResponse {
  message: string;
  comments: import('../complete').Comment[];
}

export interface LaravelCollaboratorsResponse {
  message: string;
  collaborators: import('../complete').BoardCollaborator[];
}