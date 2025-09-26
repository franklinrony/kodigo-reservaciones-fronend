export interface CreateBoardRequest {
  name: string;
  description?: string;
  is_public?: boolean;
}