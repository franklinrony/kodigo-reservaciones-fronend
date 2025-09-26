import React, { useState } from 'react';
import { DragDropContext, DropResult, Droppable } from '@hello-pangea/dnd';
import { Board, Card, CreateCardRequest } from '@/models';
import { KanbanList } from '@/components/lists/KanbanList';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { listService } from '@/services/listService';
import { cardService } from '@/services/cardService';

interface KanbanViewProps {
  board: Board;
  onCardClick: (card: Card) => void;
  onBoardUpdate: () => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  board,
  onCardClick,
  onBoardUpdate
}) => {
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    
    setLoading(true);
    try {
      await listService.createList(board.id, { name: newListName });
      setNewListName('');
      setIsAddingList(false);
      onBoardUpdate();
    } catch (error) {
      console.error('Error creating list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async (listId: number, cardData: CreateCardRequest) => {
    await cardService.createCard(listId, cardData);
    onBoardUpdate();
  };

  const handleUpdateList = async (listId: number, listData: { name: string }) => {
    try {
      await listService.updateList(board.id, listId, listData);
      onBoardUpdate();
    } catch (error) {
      console.error('Error updating list:', error);
      throw error;
    }
  };

  const handleDeleteList = async (listId: number) => {
    try {
      await listService.deleteList(board.id, listId);
      onBoardUpdate();
    } catch (error) {
      console.error('Error deleting list:', error);
      throw error;
    }
  };

  const handleUpdateCard = async (cardId: number, cardData: { title?: string; description?: string }) => {
    try {
      await cardService.updateCard(cardId, cardData);
      onBoardUpdate();
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    if (type === 'CARD') {
      const cardId = parseInt(draggableId);
      const destListId = parseInt(destination.droppableId);

      try {
        await cardService.updateCard(cardId, {
          list_id: destListId,
          position: destination.index
        });
        onBoardUpdate();
      } catch (error) {
        console.error('Error moving card:', error);
      }
    }
  };

  const lists = board.lists || [];

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="p-6 h-full overflow-x-auto">
        <Droppable droppableId="board" direction="horizontal" type="LIST">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex space-x-6"
            >
              {lists.map((list, index) => (
                <KanbanList
                  key={list.id}
                  list={list}
                  index={index}
                  onCardClick={onCardClick}
                  onCreateCard={handleCreateCard}
                  onUpdateList={handleUpdateList}
                  onDeleteList={handleDeleteList}
                  onUpdateCard={handleUpdateCard}
                />
              ))}
              {provided.placeholder}

              {/* Add List Button */}
              <div className="w-80 flex-shrink-0">
                {isAddingList ? (
                  <div className="bg-gray-100 rounded-lg p-4">
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      placeholder="Ingresa el nombre de la lista..."
                      className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      autoFocus
                    />
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={handleCreateList}
                        loading={loading}
                      >
                        Agregar lista
                      </Button>
                      <button
                        onClick={() => {
                          setIsAddingList(false);
                          setNewListName('');
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingList(true)}
                    className="w-full bg-gray-100 hover:bg-gray-200 rounded-lg p-4 flex items-center justify-center space-x-2 text-gray-600 transition-colors"
                  >
                    <Plus size={20} />
                    <span>Agregar otra lista</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
};