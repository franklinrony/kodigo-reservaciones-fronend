import React from 'react';
import { KanbanCard } from '@/components/cards/KanbanCard';
import { mockCards } from '@/utils/mockData';

export const CardPreview: React.FC = () => {
  const handleCardClick = (cardId: number) => {
    alert('Tarjeta clickeada: ' + cardId);
  };

  const handleDeleteCard = async (cardId: number) => {
    alert('Función de eliminación activada para la tarjeta ' + cardId);
  };

  const handleUpdateCard = async (_cardId: number, cardData: { title?: string; description?: string }) => {
    // preview update handler
    alert(`Tarjeta actualizada: ${JSON.stringify(cardData)}`);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Vista Previa de Tarjetas Kanban</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockCards.map((card, index) => (
            <div key={card.id} className="max-w-sm">
              <KanbanCard
                card={card}
                index={index}
                onClick={() => handleCardClick(card.id)}
                onUpdateCard={handleUpdateCard}
                onDeleteCard={handleDeleteCard}
              />
            </div>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Características del Nuevo Diseño:</h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✅ <strong>Header limpio</strong> - Solo muestra instrucción y prioridad, sin repetir título</li>
              <li>✅ <strong>Doble clic exclusivo en header</strong> - Modal solo se abre desde el header</li>
              <li>✅ <strong>Edición inline en cuerpo</strong> - Click en título o descripción para editar directamente</li>
              <li>✅ <strong>Descripción truncada</strong> - Muestra hasta 75 caracteres con indicador "... más"</li>
              <li>✅ <strong>Menú de opciones mejorado</strong> - "Editar detalles" y "Eliminar" en dropdown</li>
              <li>✅ <strong>Prioridad visual</strong> - Badge de prioridad basado en labels</li>
              <li>✅ <strong>Información de fechas</strong> - Formato inteligente de fechas límite</li>
              <li>✅ <strong>Asignación</strong> - Muestra tanto asignado como responsable</li>
              <li>✅ <strong>Indicador de prioridad</strong> - Círculo de color en la esquina</li>
              <li>✅ <strong>Compatible móvil</strong> - Opción "Editar detalles" para dispositivos sin doble clic</li>
            </ul>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">🧪 Pruebas de Fechas:</h3>
              <p className="text-sm text-blue-800 mb-3">
                Las utilidades de formato de fechas están disponibles en `src/utils/textUtils`.
              </p>
              
              <h4 className="font-semibold text-blue-900 mb-2">Instrucciones de Uso:</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• <strong>Click simple:</strong> Editar título/descripción inline (solo en el cuerpo)</li>
                <li>• <strong>Doble click en header:</strong> Abrir modal para edición completa</li>
                <li>• <strong>Tres puntos (⋯):</strong> Menú con opciones "Editar detalles" y "Eliminar"</li>
                <li>• <strong>Header limpio:</strong> Solo muestra "Doble clic para editar detalles" y prioridad</li>
                <li>• <strong>Guardado automático:</strong> Click fuera del campo de texto guarda automáticamente</li>
                <li>• <strong>Drag & Drop:</strong> Mover tarjetas entre listas (agarra desde cualquier área)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};