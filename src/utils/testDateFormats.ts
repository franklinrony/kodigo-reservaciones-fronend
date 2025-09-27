// Prueba de formato de fechas
import { formatDueDate } from './textUtils';

// Función de prueba - solo para desarrollo
export const testFormatDueDate = () => {
  console.log('🗓️ Probando formato de fechas:');
  
  // Fecha de hoy
  const today = new Date().toISOString();
  console.log(`Hoy: ${formatDueDate(today)}`);
  
  // Fecha de mañana  
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  console.log(`Mañana: ${formatDueDate(tomorrow)}`);
  
  // Fecha vencida (ayer)
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  console.log(`Ayer: ${formatDueDate(yesterday)}`);
  
  // Fecha en 7 días
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  console.log(`En 7 días: ${formatDueDate(nextWeek)}`);
  
  // Fecha en 15 días
  const in15Days = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();
  console.log(`En 15 días: ${formatDueDate(in15Days)}`);
  
  // Fecha lejana (más de 15 días)
  const farDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  console.log(`En 30 días: ${formatDueDate(farDate)}`);
};

// Llamar la función para probar
if (typeof window !== 'undefined') {
  setTimeout(testFormatDueDate, 1000);
}