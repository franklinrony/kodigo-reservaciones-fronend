export interface CreateCardRequest {
  title: string;
  description?: string;
  position?: number;
  due_date?: string;
  label_ids?: number[];
}

export interface UpdateCardRequest {
  title?: string;
  description?: string;
  list_id?: number;
  position?: number;
  due_date?: string;
}