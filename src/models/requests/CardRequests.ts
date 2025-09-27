export interface CreateCardRequest {
  title: string;
  description?: string;
  position?: number;
  due_date?: string;
  label_ids?: number[];
  assigned_to?: string;
  responsible?: string;
  estimated_days?: number;
}

export interface UpdateCardRequest {
  title?: string;
  description?: string;
  list_id?: number;
  position?: number;
  due_date?: string;
  assigned_to?: string;
  responsible?: string;
  estimated_days?: number;
  is_completed?: boolean;
}