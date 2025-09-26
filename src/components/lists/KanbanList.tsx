import React, { useState } from 'react';
import { BoardList, Card, CreateCardRequest } from '../../models';
import { KanbanCard } from '../cards/KanbanCard';
import { Button } from '../ui/Button';
import { Plus, MoreHorizontal } from 'lucide-react';
import { Droppable, Draggable } from '@hello-pangea/dnd';

interface KanbanListProps {
  list: BoardList;
  index: number;
  onCardClick: (card: Card) => void;
  onCreateCard: (listId: number, cardData: CreateCardRequest) => Promise<void>;
}

export const KanbanList: React.FC<KanbanListProps> = ({
  list,
  index,
  onCardClick,
  onCreateCard
}) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateCard = async () => {
    if (!newCardTitle.trim()) return;
    
    setLoading(true);
    try {
      await onCreateCard(list.id, { title: newCardTitle });
      setNewCardTitle('');
      setIsAddingCard(false);
    } catch (error) {
      console.error('Error creating card:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Draggable draggableId={`list-${list.id}`} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="bg-gray-100 rounded-lg p-4 w-80 flex-shrink-0"
        >
          <div {...provided.dragHandleProps} className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">{list.name}</h3>
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-500">
                {list.cards?.length || 0}
              </span>
              <button className="p-1 hover:bg-gray-200 rounded">
                <MoreHorizontal size={16} className="text-gray-500" />
              </button>
            </div>
          </div>

          <Droppable droppableId={list.id.toString()} type="CARD">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`min-h-20 ${
                  snapshot.isDraggingOver ? 'bg-blue-50 rounded-md' : ''
                }`}
              >
                {list.cards?.map((card, cardIndex) => (
                  <KanbanCard
                    key={card.id}
                    card={card}
                    index={cardIndex}
                    onClick={() => onCardClick(card)}
                  />
                ))}
                {provided.placeholder}
                
                {isAddingCard ? (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3">
                    <textarea
                      value={newCardTitle}
                      onChange={(e) => setNewCardTitle(e.target.value)}
                      placeholder="Ingresa un título para esta tarjeta..."
                      className="w-full resize-none border-0 focus:ring-0 p-0 text-sm"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex items-center space-x-2 mt-2">
                      <Button
                        size="sm"
                        onClick={handleCreateCard}
                        loading={loading}
                      >
                        Agregar tarjeta
                      </Button>
                      <button
                        onClick={() => {
                          setIsAddingCard(false);
                          setNewCardTitle('');
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingCard(true)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 w-full p-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Plus size={16} />
                    <span className="text-sm">Agregar una tarjeta</span>
                  </button>
                )}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
};