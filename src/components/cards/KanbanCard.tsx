import React, { useState } from 'react';
import { useBoardPermissions } from '@/hooks/useBoardPermissions';
import { Card as CardType } from '@/models';
import { Calendar, MessageCircle, MoreHorizontal, Trash2, Edit2 } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';
import { InlineEdit } from '@/components/ui/InlineEdit';
import { TruncatedInlineEdit } from '@/components/ui/TruncatedInlineEdit';
import { getPriorityFromLabels, formatDueDate } from '@/utils/textUtils';

interface KanbanCardProps {
  card: CardType;
  index: number;
  boardId?: number;
  onClick: () => void;
  onUpdateCard?: (cardId: number, cardData: { title?: string; description?: string }) => Promise<void>;
  onDeleteCard?: (cardId: number) => Promise<void>;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ 
  card, 
  index, 
  boardId,
  onClick, 
  onUpdateCard,
  onDeleteCard
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { priority, color: priorityColor, text: priorityText } = getPriorityFromLabels(card.labels);
  // Resolver nombre del responsable usando boardUsers si existe
  const { boardUsers } = useBoardPermissions(boardId || 0);
  const responsibleName = card.responsible || card.assigned_to || boardUsers.find((u: { id: number; name: string }) => u.id === card.assigned_user_id)?.name || '';

  const handleUpdateTitle = async (newTitle: string) => {
    if (onUpdateCard) {
      await onUpdateCard(card.id, { title: newTitle });
    }
  };

  const handleUpdateDescription = async (newDescription: string) => {
    if (onUpdateCard) {
      await onUpdateCard(card.id, { description: newDescription });
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Permitir que los componentes de edición inline manejen sus propios eventos
    // Solo prevenir propagación si es necesario para drag & drop
    const target = e.target as HTMLElement;
    
    // Si el clic es en elementos interactivos o de edición, no hacer nada
    if (target.closest('.card-header') || 
        target.closest('.card-interactive') ||
        target.closest('input') ||
        target.closest('textarea')) {
      return;
    }
    
    // El resto del área puede ser usado para drag & drop
  };

  const handleHeaderDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  const handleDeleteCard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteCard && window.confirm('¿Estás seguro de que quieres eliminar esta tarjeta?')) {
      await onDeleteCard(card.id);
    }
    setShowDropdown(false);
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  return (
    <Draggable draggableId={card.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={handleCardClick}
          className={`kanban-card bg-white rounded-lg shadow-sm border border-gray-200 mb-3 transition-all duration-200 overflow-hidden ${
            snapshot.isDragging ? 'shadow-xl rotate-2 scale-105' : ''
          }`}
        >
          {/* Header Section - Solo área para doble clic del modal */}
          <div 
            className="card-header px-4 pt-4 pb-2 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
            onDoubleClick={handleHeaderDoubleClick}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-gray-500 italic flex-1">
                Doble clic para editar detalles
              </div>
              <div className="card-interactive relative">
                <button 
                  className="text-gray-400 hover:text-gray-600 p-1 rounded"
                  onClick={handleDropdownClick}
                >
                  <MoreHorizontal size={14} />
                </button>
                
                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[140px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClick();
                        setShowDropdown(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm text-kodigo-primary hover:bg-kodigo-primary/10"
                    >
                      <Edit2 size={14} className="mr-2" />
                      Editar detalles
                    </button>
                    <button
                      onClick={handleDeleteCard}
                      className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} className="mr-2" />
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Priority indicator */}
            {priority && (
              <div className="flex items-center">
                <span 
                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
                  style={{
                    backgroundColor: `${priorityColor}20`,
                    color: priorityColor
                  }}
                >
                  Prioridad: {priorityText}
                </span>
              </div>
            )}
          </div>

          {/* Content Section - Editable inline */}
          <div className="px-4 pb-4">
            {/* Title - Inline Editable */}
            <div className="inline-edit mb-3">
              <InlineEdit
                value={card.title}
                onSave={handleUpdateTitle}
                disabled={!onUpdateCard}
                className="font-medium text-gray-900 block"
                placeholder="Sin título"
              />
            </div>

            {/* Description - Inline Editable with truncation */}
            <div className="inline-edit mb-3">
              <TruncatedInlineEdit
                value={card.description || ''}
                onSave={handleUpdateDescription}
                disabled={!onUpdateCard}
                maxLength={75}
                className="text-sm text-gray-600 block"
                placeholder="Agregar descripción..."
              />
            </div>

            {/* Labels (excluding priority) */}
            {card.labels && card.labels.filter(label => {
              const name = label.name.toLowerCase();
              return !name.includes('alta') && !name.includes('media') && !name.includes('baja') && 
                     !name.includes('high') && !name.includes('medium') && !name.includes('low');
            }).length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {card.labels.filter(label => {
                  const name = label.name.toLowerCase();
                  return !name.includes('alta') && !name.includes('media') && !name.includes('baja') && 
                         !name.includes('high') && !name.includes('medium') && !name.includes('low');
                }).map(label => (
                  <span
                    key={label.id}
                    className="px-2 py-1 text-xs font-medium rounded-full"
                    style={{
                      backgroundColor: label.color + '20',
                      color: label.color
                    }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            )}

            {/* Footer Information */}
            <div className="space-y-2">
              {/* Due Date */}
              {card.due_date && (
                <div className="flex items-center text-xs">
                  <Calendar size={12} className="mr-2 text-kodigo-primary" />
                  <span className="text-gray-600">
                    <strong>Límite:</strong> {formatDueDate(card.due_date)}
                  </span>
                </div>
              )}

              {/* Assignment */}
              <div className="flex items-center justify-between text-xs">
                <div className="space-y-1">
                  {card.assigned_to && (
                    <div className="text-gray-600">
                      <strong>Asignado:</strong> {card.assigned_to}
                    </div>
                  )}
                  {responsibleName && (
                    <div className="text-gray-600">
                      <strong>Responsable:</strong> {responsibleName}
                    </div>
                  )}
                </div>

                {/* Priority Badge */}
                {priority && (
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: priorityColor }}
                    title={`Prioridad: ${priorityText}`}
                  />
                )}
              </div>

              {/* Bottom row - Comments and User */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center space-x-3">
                  {card.comments && card.comments.length > 0 && (
                    <div className="flex items-center space-x-1 text-gray-500">
                      <MessageCircle size={12} />
                      <span className="text-xs">{card.comments.length}</span>
                    </div>
                  )}
                </div>
                
                {card.user && (
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-kodigo-primary to-kodigo-secondary rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {card.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600">{card.user.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Click outside to close dropdown */}
          {showDropdown && (
            <div 
              className="fixed inset-0 z-0" 
              onClick={() => setShowDropdown(false)}
            />
          )}
        </div>
      )}
    </Draggable>
  );
};