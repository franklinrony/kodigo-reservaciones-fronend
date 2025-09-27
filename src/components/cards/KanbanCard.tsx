import React from 'react';
import { Card as CardType } from '@/models';
import { Calendar, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Draggable } from '@hello-pangea/dnd';
import { InlineEdit } from '@/components/ui/InlineEdit';

interface KanbanCardProps {
  card: CardType;
  index: number;
  onClick: () => void;
  onUpdateCard?: (cardId: number, cardData: { title?: string; description?: string }) => Promise<void>;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ 
  card, 
  index, 
  onClick, 
  onUpdateCard 
}) => {
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
    // Solo abrir modal si no se está editando inline
    const target = e.target as HTMLElement;
    if (!target.closest('.inline-edit')) {
      onClick();
    }
  };
  return (
    <Draggable draggableId={card.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={handleCardClick}
          className={`bg-white rounded-lg shadow-sm border-l-4 border-kodigo-primary p-4 mb-3 cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200 ${
            snapshot.isDragging ? 'shadow-xl rotate-3 scale-105' : ''
          }`}
        >
          <div className="inline-edit">
            <InlineEdit
              value={card.title}
              onSave={handleUpdateTitle}
              disabled={!onUpdateCard}
              className="font-medium text-gray-900 mb-2 block"
              placeholder="Sin título"
            />
          </div>
          
          <div className="inline-edit">
            <InlineEdit
              value={card.description || ''}
              onSave={handleUpdateDescription}
              disabled={!onUpdateCard}
              multiline
              className="text-sm text-gray-600 mb-3 line-clamp-2 block"
              placeholder="Agregar descripción..."
            />
          </div>
          
          {/* Labels */}
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {card.labels.map(label => (
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
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              {card.due_date && (
                <div className="flex items-center space-x-1 text-kodigo-accent">
                  <Calendar size={12} />
                  <span>{format(new Date(card.due_date), 'dd/MM')}</span>
                </div>
              )}
              
              {card.comments && card.comments.length > 0 && (
                <div className="flex items-center space-x-1 text-kodigo-secondary">
                  <MessageCircle size={12} />
                  <span>{card.comments.length}</span>
                </div>
              )}
            </div>
            
            {card.user && (
              <div className="w-6 h-6 bg-kodigo-gradient rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white text-xs font-medium">
                  {card.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};