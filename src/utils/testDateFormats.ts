// Prueba de formato de fechas
import { formatDueDate } from './textUtils';

// Función de prueba - solo para desarrollo
export const testFormatDueDate = () => {
  // Silent test helper - logs removed for production
  const today = new Date().toISOString();
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const in15Days = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();
  const farDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  // If you need to inspect values during development, call formatDueDate(...) in the console.
};

// Llamar la función para probar
if (typeof window !== 'undefined') {
  setTimeout(testFormatDueDate, 1000);
}