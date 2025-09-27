import { Card, Label } from '@/models';

// Labels de ejemplo con prioridades
export const mockLabels: Label[] = [
  {
    id: 1,
    name: 'Prioridad Alta',
    color: '#EF4444',
    board_id: 1,
    priority: 'alta',
    created_at: '2025-09-01T00:00:00Z',
    updated_at: '2025-09-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Prioridad Media',
    color: '#F59E0B',
    board_id: 1,
    priority: 'media',
    created_at: '2025-09-01T00:00:00Z',
    updated_at: '2025-09-01T00:00:00Z'
  },
  {
    id: 3,
    name: 'Prioridad Baja',
    color: '#10B981',
    board_id: 1,
    priority: 'baja',
    created_at: '2025-09-01T00:00:00Z',
    updated_at: '2025-09-01T00:00:00Z'
  },
  {
    id: 4,
    name: 'Backend',
    color: '#3B82F6',
    board_id: 1,
    created_at: '2025-09-01T00:00:00Z',
    updated_at: '2025-09-01T00:00:00Z'
  },
  {
    id: 5,
    name: 'Frontend',
    color: '#8B5CF6',
    board_id: 1,
    created_at: '2025-09-01T00:00:00Z',
    updated_at: '2025-09-01T00:00:00Z'
  }
];

// Cards de ejemplo como los mostrados en las imágenes
export const mockCards: Card[] = [
  {
    id: 1,
    title: 'Evaluación de los Modelos',
    description: 'Revisar y evaluar todos los modelos de la base de datos para asegurar que estén alineados con los requerimientos del proyecto. Verificar relaciones, campos y restricciones.',
    board_list_id: 1,
    user_id: 1,
    position: 0,
    due_date: '2025-10-12T00:00:00Z', // 15 días desde hoy
    is_completed: false,
    is_archived: false,
    priority: 'alta',
    assigned_to: 'Jefe',
    responsible: 'Juan',
    estimated_days: 15,
    created_at: '2025-09-01T00:00:00Z',
    updated_at: '2025-09-27T00:00:00Z',
    user: {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@example.com',
      created_at: '2025-09-01T00:00:00Z',
      updated_at: '2025-09-01T00:00:00Z'
    },
    labels: [mockLabels[0], mockLabels[3]], // Alta prioridad + Backend
    comments: [
      {
        id: 1,
        content: 'Comentario de ejemplo',
        card_id: 1,
        user_id: 1,
        created_at: '2025-09-27T00:00:00Z',
        updated_at: '2025-09-27T00:00:00Z'
      }
    ]
  },
  {
    id: 2,
    title: 'Redacción capítulo 3',
    description: 'Completar la redacción del tercer capítulo del documento técnico, incluyendo análisis de casos de uso y diagramas de flujo.',
    board_list_id: 1,
    user_id: 2,
    position: 1,
    due_date: '2025-09-28T00:00:00Z', // Mañana
    is_completed: false,
    is_archived: false,
    priority: 'alta',
    assigned_to: 'Jefe',
    responsible: 'Juan',
    estimated_days: 15,
    created_at: '2025-09-01T00:00:00Z',
    updated_at: '2025-09-27T00:00:00Z',
    user: {
      id: 2,
      name: 'María García',
      email: 'maria@example.com',
      created_at: '2025-09-01T00:00:00Z',
      updated_at: '2025-09-01T00:00:00Z'
    },
    labels: [mockLabels[0]], // Alta prioridad
    comments: []
  },
  {
    id: 3,
    title: 'Redacción del índice del documento',
    description: 'Crear un índice detallado para el documento principal que incluya todas las secciones, subsecciones y referencias necesarias para una navegación eficiente.',
    board_list_id: 2,
    user_id: 1,
    position: 0,
    due_date: '2025-09-26T00:00:00Z', // Ayer (vencida)
    is_completed: false,
    is_archived: false,
    priority: 'alta',
    assigned_to: 'Jefe',
    responsible: 'Juan',
    estimated_days: 15,
    created_at: '2025-09-01T00:00:00Z',
    updated_at: '2025-09-27T00:00:00Z',
    user: {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@example.com',
      created_at: '2025-09-01T00:00:00Z',
      updated_at: '2025-09-01T00:00:00Z'
    },
    labels: [mockLabels[0], mockLabels[4]], // Alta prioridad + Frontend
    comments: []
  },
  {
    id: 4,
    title: 'Optimización de consultas',
    description: 'Revisar y optimizar las consultas más lentas de la base de datos para mejorar el rendimiento general del sistema.',
    board_list_id: 2,
    user_id: 3,
    position: 1,
    due_date: '2025-12-15T00:00:00Z', // Fecha lejana (más de 15 días)
    is_completed: false,
    is_archived: false,
    priority: 'media',
    assigned_to: 'Ana',
    responsible: 'Carlos',
    estimated_days: 8,
    created_at: '2025-09-01T00:00:00Z',
    updated_at: '2025-09-27T00:00:00Z',
    user: {
      id: 3,
      name: 'Carlos López',
      email: 'carlos@example.com',
      created_at: '2025-09-01T00:00:00Z',
      updated_at: '2025-09-01T00:00:00Z'
    },
    labels: [mockLabels[1], mockLabels[3]], // Media prioridad + Backend
    comments: [
      {
        id: 2,
        content: 'Revisar índices de la tabla cards',
        card_id: 4,
        user_id: 3,
        created_at: '2025-09-27T00:00:00Z',
        updated_at: '2025-09-27T00:00:00Z'
      },
      {
        id: 3,
        content: 'Implementar paginación en listados',
        card_id: 4,
        user_id: 1,
        created_at: '2025-09-26T00:00:00Z',
        updated_at: '2025-09-26T00:00:00Z'
      }
    ]
  },
  {
    id: 5,
    title: 'Tarea sin fecha límite',
    description: 'Esta es una tarea que no tiene fecha de vencimiento asignada para probar que no se muestre el campo cuando no hay fecha.',
    board_list_id: 2,
    user_id: 2,
    position: 2,
    // due_date: undefined, // Sin fecha
    is_completed: false,
    is_archived: false,
    priority: 'baja',
    assigned_to: 'María',
    responsible: 'Ana',
    estimated_days: 5,
    created_at: '2025-09-01T00:00:00Z',
    updated_at: '2025-09-27T00:00:00Z',
    user: {
      id: 2,
      name: 'María García',
      email: 'maria@example.com',
      created_at: '2025-09-01T00:00:00Z',
      updated_at: '2025-09-01T00:00:00Z'
    },
    labels: [mockLabels[2]], // Baja prioridad
    comments: []
  }
];