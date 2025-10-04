/**
 * Trunca texto manteniendo palabras completas y agregando indicador si es necesario
 */
export const truncateText = (text: string, maxLength: number): { truncated: string; hasMore: boolean } => {
  if (!text || text.length <= maxLength) {
    return { truncated: text || '', hasMore: false };
  }

  // Encontrar el último espacio antes del límite
  let truncateIndex = maxLength;
  for (let i = maxLength - 1; i >= 0; i--) {
    if (text[i] === ' ') {
      truncateIndex = i;
      break;
    }
  }

  // Si no encontramos espacio, usar el límite exacto
  if (truncateIndex === maxLength) {
    truncateIndex = maxLength - 3; // Reservar espacio para "..."
  }

  return {
    truncated: text.substring(0, truncateIndex).trim(),
    hasMore: true
  };
};

/**
 * Obtiene el color y texto de prioridad basado en labels
 */
export const getPriorityFromLabels = (labels?: Array<{ name: string; color: string }>): { 
  priority: 'alta' | 'media' | 'baja' | null; 
  color: string; 
  text: string 
} => {
  if (!labels || labels.length === 0) {
    return { priority: null, color: '#6B7280', text: '' };
  }

  // Buscar labels que indiquen prioridad
  const priorityLabel = labels.find(label => {
    const name = label.name.toLowerCase();
    return name.includes('alta') || name.includes('high') || 
           name.includes('media') || name.includes('medium') || 
           name.includes('baja') || name.includes('low');
  });

  if (!priorityLabel) {
    return { priority: null, color: labels[0].color, text: labels[0].name };
  }

  const name = priorityLabel.name.toLowerCase();
  if (name.includes('alta') || name.includes('high')) {
    return { priority: 'alta', color: priorityLabel.color, text: 'Alta' };
  }
  if (name.includes('media') || name.includes('medium')) {
    return { priority: 'media', color: priorityLabel.color, text: 'Media' };
  }
  if (name.includes('baja') || name.includes('low')) {
    return { priority: 'baja', color: priorityLabel.color, text: 'Baja' };
  }

  return { priority: null, color: priorityLabel.color, text: priorityLabel.name };
};

/**
 * Formatea la fecha de vencimiento con el formato adecuado
 */
export const formatDueDate = (dateString: string): string => {
  if (!dateString) return '';

  // Si la cadena tiene componente de tiempo ISO, usar solo la parte YYYY-MM-DD
  // para evitar que la conversión a Date en zona horaria local desplace el día.
  let year: number, month: number, day: number;
  try {
    const datePart = dateString.includes('T') ? dateString.split('T')[0] : dateString;
    const parts = datePart.split('-').map(p => parseInt(p, 10));
    if (parts.length >= 3 && parts.every(n => !Number.isNaN(n))) {
      [year, month, day] = parts;
    } else {
      // Fallback a Date parsing si el formato no es YYYY-MM-DD
      const parsed = new Date(dateString);
      year = parsed.getFullYear();
      month = parsed.getMonth() + 1;
      day = parsed.getDate();
    }
  } catch {
    // Si falla, devolver cadena vacía
    return '';
  }

  // Construir una fecha sin horas (local) basada únicamente en la fecha (evita shift por timezone)
  const date = new Date(year, month - 1, day);
  const now = new Date();

  // Resetear las horas para una comparación precisa de días
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return `${date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })} (${overdueDays === 1 ? '1 día' : `${overdueDays} días`} de retraso)`;
  } else if (diffDays === 0) {
    return `${date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })} (Hoy)`;
  } else if (diffDays <= 15) {
    return `${date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })} (${diffDays === 1 ? '1 día' : `${diffDays} días`})`;
  } else {
    return `${date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })} (${diffDays === 1 ? '1 día' : `${diffDays} días`})`;
  }
};