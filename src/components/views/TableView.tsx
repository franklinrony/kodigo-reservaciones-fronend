import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Board, Card, UpdateCardRequest } from '../../models';
import { Calendar, MessageCircle, User, Edit2, Check, X, GripVertical } from 'lucide-react';
import { cardService } from '../../services/cardService';
import { useNotification } from '../../hooks/useNotification';
import { useSyncContext } from '../../contexts/SyncContext';
import { truncateText, getPriorityFromLabels, formatDueDate } from '@/utils/textUtils';
import { useBoardPermissions } from '../../hooks/useBoardPermissions';

interface TableViewProps {
  board: Board;
  onCardClick: (card: Card) => void;
  onBoardUpdate: () => void;
}

interface ExtendedCard extends Card {
  listName: string;
  listId: number;
}

export const TableView: React.FC<TableViewProps> = ({ board, onCardClick, onBoardUpdate }) => {
  const [editingCard, setEditingCard] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<'title' | 'description' | null>(null);
  const [editValue, setEditValue] = useState('');
  const { showNotification } = useNotification();
  const { startSync, endSync } = useSyncContext();
  const { canEdit } = useBoardPermissions(board.id);
  const { boardUsers } = useBoardPermissions(board.id);

  // Estado optimista para la tabla
  const [optimisticCards, setOptimisticCards] = useState<ExtendedCard[]>([]);

  // Actualizar estado optimista cuando cambia el board
  React.useEffect(() => {
    const sortedLists = board.lists?.sort((a, b) => a.position - b.position) || [];
    const currentCards: ExtendedCard[] = sortedLists.flatMap(list => 
      (list.cards?.sort((a, b) => a.position - b.position).map(card => ({ ...card, listName: list.name, listId: list.id })) || [])
    );
    setOptimisticCards(currentCards);
  }, [board]);

  // Helper function para revertir cambios optimistas
  const revertOptimisticChanges = () => {
    const sortedLists = board.lists?.sort((a, b) => a.position - b.position) || [];
    const currentCards: ExtendedCard[] = sortedLists.flatMap(list => 
      (list.cards?.sort((a, b) => a.position - b.position).map(card => ({ ...card, listName: list.name, listId: list.id })) || [])
    );
    setOptimisticCards(currentCards);
  };

  // Helper function para reordenar optimísticamente
  const reorderCardsOptimistically = (sourceIndex: number, destIndex: number): ExtendedCard[] => {
    const newCards = [...optimisticCards];
    const [movedCard] = newCards.splice(sourceIndex, 1);
    newCards.splice(destIndex, 0, movedCard);
    
    // Actualizar posiciones
    newCards.forEach((card, index) => {
      card.position = index + 1;
    });
    
    return newCards;
  };

  // Función para iniciar edición inline
  const startEditing = (card: Card, field: 'title' | 'description') => {
    // Si el usuario no puede editar, no permitir edición inline
    if (!canEdit) return;

    setEditingCard(card.id);
    setEditingField(field);
    setEditValue(field === 'title' ? card.title : card.description || '');
  };

  // Función para cancelar edición
  const cancelEditing = () => {
    setEditingCard(null);
    setEditingField(null);
    setEditValue('');
  };

  // Función para guardar cambios inline
  const saveInlineEdit = async (cardId: number) => {
    if (!editingField) return;

    try {
      startSync(`edit-card-${cardId}`);
      
      const updateData: UpdateCardRequest = {
        [editingField]: editValue
      };

      await cardService.updateCard(cardId, updateData);
      showNotification('success', `${editingField === 'title' ? 'Título' : 'Descripción'} actualizada`);
      
      cancelEditing();
      setTimeout(() => {
        onBoardUpdate();
        endSync(`edit-card-${cardId}`);
      }, 300);
      
    } catch (error) {
      console.error('Error updating card:', error);
      showNotification('error', 'Error al actualizar la tarjeta');
      endSync(`edit-card-${cardId}`);
    }
  };

  // Función para cambiar lista de una tarjeta
  const changeCardList = async (cardId: number, newListId: number) => {
    try {
      startSync(`move-card-${cardId}`);
      
      await cardService.updateCard(cardId, {
        list_id: newListId
      });
      
      showNotification('success', 'Tarjeta movida correctamente');
      
      setTimeout(() => {
        onBoardUpdate();
        endSync(`move-card-${cardId}`);
      }, 300);
      
    } catch (error) {
      console.error('Error moving card:', error);
      showNotification('error', 'Error al mover la tarjeta');
      endSync(`move-card-${cardId}`);
    }
  };

  // Función para manejar drag & drop con actualizaciones optimistas
  const handleDragEnd = async (result: DropResult) => {
    // Si el usuario no puede editar, no permitir drag & drop
    if (!canEdit) return;

    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    const cardId = parseInt(result.draggableId);
    
    // Si no cambió de posición, no hacer nada
    if (sourceIndex === destIndex) return;

    // 1. Aplicar cambio optimista inmediatamente
    const newCards = reorderCardsOptimistically(sourceIndex, destIndex);
    setOptimisticCards(newCards);

    try {
      // 2. Hacer la petición al backend en segundo plano
      startSync(`reorder-card-${cardId}`);
      
      await cardService.updateCard(cardId, {
        position: destIndex + 1
      });
      
      // 3. Si es exitoso, mostrar notificación sutil
      showNotification('success', 'Orden actualizado');
      
      // Actualizar datos reales en background
      setTimeout(() => {
        onBoardUpdate();
        endSync(`reorder-card-${cardId}`);
      }, 300);
      
    } catch (error) {
      console.error('Error reordering card:', error);
      console.warn('Card reorder operation failed. Reverting optimistic changes.');
      
      // 4. Si falla, revertir el cambio optimista y mostrar error
      revertOptimisticChanges();
      showNotification('error', 'Error al reordenar la tarjeta');
      endSync(`reorder-card-${cardId}`);
    }
  };

  return (
    <div className="p-6">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-3 w-8"></th> {/* Drag handle */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarjeta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prioridad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha límite
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asignado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comentarios
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <Droppable droppableId="table-cards">
              {(provided) => (
                <tbody 
                  className="bg-white divide-y divide-gray-200"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {optimisticCards.map((card: ExtendedCard, index) => (
                    <Draggable key={card.id} draggableId={card.id.toString()} index={index}>
                      {(provided, snapshot) => (
                        <tr
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`hover:bg-gray-50 ${snapshot.isDragging ? 'bg-kodigo-light/20' : ''}`}
                        >
                          {/* Drag Handle */}
                          <td className="px-2 py-4">
                            <div {...provided.dragHandleProps} className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-kodigo-primary">
                              <GripVertical size={16} />
                            </div>
                          </td>

                          {/* Tarjeta (Title + Description) */}
                          <td className="px-6 py-4 whitespace-nowrap max-w-sm">
                            <div className="space-y-1">
                              {/* Title */}
                              {editingCard === card.id && editingField === 'title' ? (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="text-sm font-medium border border-kodigo-primary rounded px-2 py-1 flex-1"
                                    onKeyPress={(e) => e.key === 'Enter' && saveInlineEdit(card.id)}
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => saveInlineEdit(card.id)}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button
                                    onClick={cancelEditing}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              ) : (
                                <div 
                                  className="text-sm font-medium text-gray-900 flex items-center group cursor-pointer"
                                  onClick={() => startEditing(card, 'title')}
                                  onDoubleClick={() => onCardClick(card)}
                                >
                                  <span>{card.title}</span>
                                  <Edit2 size={14} className="ml-2 opacity-0 group-hover:opacity-100 text-kodigo-primary" />
                                </div>
                              )}

                              {/* Description */}
                              {editingCard === card.id && editingField === 'description' ? (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    placeholder="Descripción..."
                                    className="text-sm border border-kodigo-primary rounded px-2 py-1 flex-1"
                                    onKeyPress={(e) => e.key === 'Enter' && saveInlineEdit(card.id)}
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => saveInlineEdit(card.id)}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button
                                    onClick={cancelEditing}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              ) : (
                                <div 
                                  className="text-sm text-gray-500 max-w-xs group cursor-pointer"
                                  onClick={() => startEditing(card, 'description')}
                                >
                                  {card.description ? (
                                    <div className="flex items-center">
                                      <span>
                                        {(() => {
                                          const { truncated, hasMore } = truncateText(card.description, 75);
                                          return (
                                            <>
                                              {truncated}
                                              {hasMore && <span className="text-kodigo-primary ml-1 font-medium">... más</span>}
                                            </>
                                          );
                                        })()}
                                      </span>
                                      <Edit2 size={12} className="ml-2 opacity-0 group-hover:opacity-100 text-kodigo-primary" />
                                    </div>
                                  ) : (
                                    <div className="flex items-center text-gray-400">
                                      <span>Agregar descripción...</span>
                                      <Edit2 size={12} className="ml-2 opacity-0 group-hover:opacity-100 text-kodigo-primary" />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Prioridad */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {(() => {
                              const { priority, color, text } = getPriorityFromLabels(card.labels);
                              return priority ? (
                                <span 
                                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
                                  style={{
                                    backgroundColor: `${color}20`,
                                    color: color
                                  }}
                                >
                                  {text}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              );
                            })()}
                          </td>

                          {/* Lista (Dropdown) */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={card.listId}
                              onChange={(e) => changeCardList(card.id, parseInt(e.target.value))}
                              className="text-xs px-2 py-1 border border-gray-300 rounded-full bg-kodigo-primary/10 text-kodigo-primary font-semibold focus:ring-kodigo-primary focus:border-kodigo-primary"
                            >
                              {board.lists?.map(list => (
                                <option key={list.id} value={list.id}>
                                  {list.name}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Fecha límite */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {card.due_date ? (
                              <div className="flex items-center space-x-1">
                                <Calendar size={14} className="text-kodigo-primary" />
                                <span>{formatDueDate(card.due_date)}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>

                          {/* Asignado */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              {card.assigned_to && (
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 bg-gradient-to-r from-kodigo-primary to-kodigo-secondary rounded-full flex items-center justify-center">
                                    <User size={12} className="text-white" />
                                  </div>
                                  <span className="text-sm text-gray-900">{card.assigned_to}</span>
                                </div>
                              )}
                              {(() => {
                                const responsibleName = card.responsible || boardUsers.find((u: { id: number; name: string }) => u.id === card.assigned_user_id)?.name;
                                return responsibleName ? (
                                  <div className="text-xs text-gray-500">
                                    <strong>Resp:</strong> {responsibleName}
                                  </div>
                                ) : null;
                              })()}
                              {!card.assigned_to && !card.responsible && (
                                <span className="text-gray-400">-</span>
                              )}
                            </div>
                          </td>

                          {/* Comentarios */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {card.comments && card.comments.length > 0 ? (
                              <div className="flex items-center space-x-1">
                                <MessageCircle size={14} className="text-kodigo-primary" />
                                <span>{card.comments.length}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>

                          {/* Acciones */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => onCardClick(card)}
                              className="text-kodigo-primary hover:text-kodigo-dark font-medium"
                            >
                              Ver detalles
                            </button>
                          </td>
                        </tr>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </tbody>
              )}
            </Droppable>
          </table>
          
          {optimisticCards.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay tarjetas en este tablero</p>
            </div>
          )}
        </div>
      </DragDropContext>
    </div>
  );
};