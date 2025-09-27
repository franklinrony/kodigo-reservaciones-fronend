import React, { useState } from 'react';
import { DragDropContext, DropResult, Droppable } from '@hello-pangea/dnd';
import { Board, Card, CreateCardRequest } from '@/models';
import { KanbanList } from '@/components/lists/KanbanList';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { listService } from '@/services/listService';
import { cardService } from '@/services/cardService';
import { useNotification } from '@/hooks/useNotification';

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
  const { showNotification } = useNotification();

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    
    setLoading(true);
    try {
      await listService.createList(board.id, { name: newListName });
      setNewListName('');
      setIsAddingList(false);
      onBoardUpdate();
      showNotification('success', 'Lista creada correctamente');
    } catch (error) {
      console.error('Error creating list:', error);
      showNotification('error', error instanceof Error ? error.message : 'Error al crear la lista');
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
      showNotification('success', 'Lista actualizada correctamente');
    } catch (error) {
      console.error('Error updating list:', error);
      showNotification('error', error instanceof Error ? error.message : 'Error al actualizar la lista');
      throw error;
    }
  };

  const handleDeleteList = async (listId: number) => {
    try {
      await listService.deleteList(board.id, listId);
      onBoardUpdate();
      showNotification('success', 'Lista eliminada correctamente');
    } catch (error) {
      console.error('Error deleting list:', error);
      showNotification('error', error instanceof Error ? error.message : 'Error al eliminar la lista');
      throw error;
    }
  };

  const handleUpdateCard = async (cardId: number, cardData: { title?: string; description?: string }) => {
    try {
      await cardService.updateCard(cardId, cardData);
      onBoardUpdate();
      showNotification('success', 'Tarjeta actualizada correctamente');
    } catch (error) {
      console.error('Error updating card:', error);
      // Mostrar notificación de error al usuario
      showNotification('error', error instanceof Error ? error.message : 'Error al actualizar la tarjeta');
      // Recargar el tablero para obtener el estado más reciente
      onBoardUpdate();
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
        showNotification('success', 'Tarjeta movida correctamente');
      } catch (error) {
        console.error('Error moving card:', error);
        console.warn('Card drag operation failed. This is typically due to backend data inconsistency.');
        // Mostrar notificación de error al usuario
        showNotification('error', error instanceof Error ? error.message : 'Error al mover la tarjeta');
        // Recargar el tablero para restaurar el estado anterior
        onBoardUpdate();
      }
    }
  };

  const lists = board.lists || [];

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="p-6 h-full overflow-x-auto bg-gray-50">
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
                  <div className="bg-white rounded-lg p-4 shadow-md border">
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      placeholder="Ingresa el nombre de la lista..."
                      className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-kodigo-primary focus:border-kodigo-primary"
                      autoFocus
                    />
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={handleCreateList}
                        loading={loading}
                        variant="gradient"
                      >
                        Agregar lista
                      </Button>
                      <button
                        onClick={() => {
                          setIsAddingList(false);
                          setNewListName('');
                        }}
                        className="text-gray-500 hover:text-kodigo-primary transition-colors duration-200"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingList(true)}
                    className="w-full bg-white hover:bg-kodigo-light/30 border-2 border-dashed border-kodigo-primary/30 hover:border-kodigo-primary rounded-lg p-4 flex items-center justify-center space-x-2 text-kodigo-primary hover:text-kodigo-dark transition-all duration-200 shadow-sm hover:shadow-md"
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