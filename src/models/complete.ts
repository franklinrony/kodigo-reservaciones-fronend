// Tipos base
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  role?: 'owner' | 'admin' | 'editor' | 'viewer'; // Rol específico en un tablero
}

export interface Label {
  id: number;
  name: string;
  color: string;
  board_id: number;
  created_at: string;
  updated_at: string;
  priority?: 'alta' | 'media' | 'baja'; // Prioridad basada en el label
}

// Tipo para comentarios con usuario completo
export interface Comment {
  id: number;
  content: string;
  card_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  user?: User;
}

// Tipo para tarjetas con relaciones completas
export interface Card {
  id: number;
  title: string;
  description?: string;
  board_list_id: number;
  user_id: number;
  assigned_user_id?: number; // ID del usuario asignado
  assigned_by?: number; // ID de quien asignó la tarjeta
  position: number;
  due_date?: string;
  is_completed: boolean;
  is_archived: boolean;
  progress_percentage?: number; // Porcentaje de progreso (0-100)
  priority?: 'alta' | 'media' | 'baja'; // Prioridad derivada del label principal
  assigned_to?: string; // Usuario asignado (nombre)
  responsible?: string; // Responsable
  estimated_days?: number; // Días estimados
  created_at: string;
  updated_at: string;
  user?: User;
  labels?: Label[];
  comments?: Comment[];
}

// Tipo para listas con tarjetas completas
export interface BoardList {
  id: number;
  name: string;
  board_id: number;
  position: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  cards?: Card[];
}

// Tipo para colaboradores con usuario completo
export interface BoardCollaborator {
  id: number;
  board_id: number;
  user_id: number;
  role: 'viewer' | 'editor' | 'admin';
  created_at: string;
  updated_at: string;
  user?: User;
}

// Tipo para tablero con relaciones completas
export interface Board {
  id: number;
  name: string;
  description?: string;
  user_id: number;
  is_public: boolean;
  background_color?: string;
  background_image?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  lists?: BoardList[];
  labels?: Label[];
  collaborators?: BoardCollaborator[];
  lists_count?: number; // Número de listas
  collaborators_count?: number; // Número de colaboradores
}