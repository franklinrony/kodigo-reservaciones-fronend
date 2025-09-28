import React, { useState, useEffect } from 'react';
import { DragDropContext, DropResult, Droppable } from '@hello-pangea/dnd';
import { Board, Card, CreateCardRequest } from '@/models';
import { KanbanList } from '@/components/lists/KanbanList';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { listService } from '@/services/listService';
import { cardService } from '@/services/cardService';
import { useNotification } from '@/hooks/useNotification';
import { useSyncContext } from '@/contexts/SyncContext';
import { useBoardPermissions } from '@/hooks/useBoardPermissions';

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
  const { startSync, endSync } = useSyncContext();
  const { canEdit } = useBoardPermissions(board.id);

  // Estado local para optimistic updates
  const [optimisticBoard, setOptimisticBoard] = useState<Board>(board);

  // Actualizar estado local cuando cambie el board prop
  useEffect(() => {
    setOptimisticBoard(board);
  }, [board]);

  // Helper function para mover una card optimistamente
  const moveCardOptimistically = (
    cardId: number, 
    sourceListId: number, 
    destListId: number, 
    _sourceIndex: number, // Marcado como no usado con _
    destIndex: number
  ): Board => {
    const newBoard = { ...optimisticBoard };
    newBoard.lists = newBoard.lists?.map(list => ({ ...list, cards: [...(list.cards || [])] })) || [];

    const sourceList = newBoard.lists.find(list => list.id === sourceListId);
    const destList = newBoard.lists.find(list => list.id === destListId);

    if (!sourceList || !destList) return optimisticBoard;

    // Encontrar y remover la tarjeta de la lista origen
    const cardToMove = sourceList.cards?.find(card => card.id === cardId);
    if (!cardToMove) return optimisticBoard;

    sourceList.cards = sourceList.cards?.filter(card => card.id !== cardId) || [];

    // Actualizar los datos de la tarjeta
    const updatedCard = {
      ...cardToMove,
      list_id: destListId,
      position: destIndex + 1
    };

    // Insertar la tarjeta en la lista destino
    destList.cards = destList.cards || [];
    destList.cards.splice(destIndex, 0, updatedCard);

    // Actualizar posiciones de las tarjetas afectadas
    sourceList.cards?.forEach((card, index) => {
      card.position = index + 1;
    });

    destList.cards.forEach((card, index) => {
      card.position = index + 1;
    });

    return newBoard;
  };

  // Helper function para revertir cambios optimistas
  const revertOptimisticChanges = () => {
    setOptimisticBoard(board);
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    
    setLoading(true);
    try {
      await listService.createList(board.id, { name: newListName });
      setNewListName('');
      setIsAddingList(false);
      showNotification('success', 'Lista creada correctamente');
      
      // Actualizar datos reales en background
      setTimeout(() => {
        onBoardUpdate();
      }, 300);
    } catch (error) {
      console.error('Error creating list:', error);
      showNotification('error', error instanceof Error ? error.message : 'Error al crear la lista');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async (listId: number, cardData: CreateCardRequest) => {
    try {
      await cardService.createCard(listId, cardData);
      showNotification('success', 'Tarjeta creada correctamente');
      
      // Actualizar datos reales en background  
      setTimeout(() => {
        onBoardUpdate();
      }, 300);
    } catch (error) {
      console.error('Error creating card:', error);
      showNotification('error', error instanceof Error ? error.message : 'Error al crear la tarjeta');
    }
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

  const handleDeleteCard = async (cardId: number) => {
    try {
      await cardService.deleteCard(cardId);
      onBoardUpdate();
      showNotification('success', 'Tarjeta eliminada correctamente');
    } catch (error) {
      console.error('Error deleting card:', error);
      showNotification('error', error instanceof Error ? error.message : 'Error al eliminar la tarjeta');
      throw error;
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    // Si el usuario no puede editar, no permitir drag & drop
    if (!canEdit) return;

    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    if (type === 'CARD') {
      const cardId = parseInt(draggableId);
      const sourceListId = parseInt(source.droppableId);
      const destListId = parseInt(destination.droppableId);

      // 1. Aplicar cambio optimista inmediatamente
      const newBoard = moveCardOptimistically(
        cardId, 
        sourceListId, 
        destListId, 
        source.index, 
        destination.index
      );
      setOptimisticBoard(newBoard);

      try {
        // 2. Hacer la petición al backend en segundo plano
        startSync(`move-card-${cardId}`);
        await cardService.updateCard(cardId, {
          list_id: destListId,
          position: destination.index + 1
        });
        
        // 3. Si es exitoso, mostrar notificación sutil y actualizar datos reales
        showNotification('success', 'Tarjeta movida correctamente');
        
        // Actualizar datos reales en background sin recargar visualmente
        setTimeout(() => {
          onBoardUpdate();
          endSync(`move-card-${cardId}`);
        }, 300); // Reducido el delay para mejor UX
        
      } catch (error) {
        console.error('Error moving card:', error);
        console.warn('Card drag operation failed. This is typically due to backend data inconsistency.');
        
        // 4. Si falla, revertir el cambio optimista y mostrar error
        revertOptimisticChanges();
        showNotification('error', error instanceof Error ? error.message : 'Error al mover la tarjeta');
        endSync(`move-card-${cardId}`);
      }
    }
  };

  const lists = optimisticBoard.lists || [];

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
                  boardId={board.id}
                  onCardClick={onCardClick}
                  onCreateCard={handleCreateCard}
                  onUpdateList={handleUpdateList}
                  onDeleteList={handleDeleteList}
                  onUpdateCard={handleUpdateCard}
                  onDeleteCard={handleDeleteCard}
                />
              ))}
              {provided.placeholder}

              {/* Add List Button - Only visible for users who can edit */}
              {canEdit && (
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
              )}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
};