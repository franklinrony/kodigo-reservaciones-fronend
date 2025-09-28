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
  assigned_user_id?: number;
  assigned_by?: number | null; // ID de quien asigna la tarjeta
  progress_percentage?: number;
  label_ids?: number[];
  is_completed?: boolean;
  // Explícitamente NO incluir user_id - ese es el creador y no se puede cambiar
}