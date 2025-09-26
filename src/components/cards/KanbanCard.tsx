import React from 'react';
import { Card as CardType } from '@/models';
import { Calendar, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Draggable } from '@hello-pangea/dnd';

interface KanbanCardProps {
  card: CardType;
  index: number;
  onClick: () => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ card, index, onClick }) => {
  return (
    <Draggable draggableId={card.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow ${
            snapshot.isDragging ? 'shadow-lg rotate-3' : ''
          }`}
        >
          <h4 className="font-medium text-gray-900 mb-2">{card.title}</h4>
          
          {card.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{card.description}</p>
          )}
          
          {/* Labels */}
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {card.labels.map(label => (
                <span
                  key={label.id}
                  className="px-2 py-1 text-xs font-medium rounded"
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
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              {card.due_date && (
                <div className="flex items-center space-x-1">
                  <Calendar size={12} />
                  <span>{format(new Date(card.due_date), 'dd/MM')}</span>
                </div>
              )}
              
              {card.comments && card.comments.length > 0 && (
                <div className="flex items-center space-x-1">
                  <MessageCircle size={12} />
                  <span>{card.comments.length}</span>
                </div>
              )}
            </div>
            
            {card.user && (
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
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