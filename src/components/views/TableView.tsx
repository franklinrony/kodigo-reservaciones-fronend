import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Board, Card, UpdateCardRequest } from '../../models';
import { Calendar, MessageCircle, User, Edit2, Check, X, GripVertical } from 'lucide-react';
import { format } from 'date-fns';
import { cardService } from '../../services/cardService';
import { useNotification } from '../../hooks/useNotification';
import { useSyncContext } from '../../contexts/SyncContext';

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

  const allCards: ExtendedCard[] = board.lists?.flatMap(list => 
    list.cards?.map(card => ({ ...card, listName: list.name, listId: list.id })) || []
  ) || [];

  // Función para iniciar edición inline
  const startEditing = (card: Card, field: 'title' | 'description') => {
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

  // Función para manejar drag & drop
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const cardId = parseInt(result.draggableId);
    const newIndex = result.destination.index;
    
    // En vista tabla, solo reordenamos, no cambiamos de lista
    try {
      startSync(`reorder-card-${cardId}`);
      
      await cardService.updateCard(cardId, {
        position: newIndex
      });
      
      showNotification('success', 'Orden actualizado');
      
      setTimeout(() => {
        onBoardUpdate();
        endSync(`reorder-card-${cardId}`);
      }, 300);
      
    } catch (error) {
      console.error('Error reordering card:', error);
      showNotification('error', 'Error al reordenar');
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
                  Lista
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de vencimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comentarios
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asignado
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
                  {allCards.map((card: ExtendedCard, index) => (
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
                                  className="text-sm text-gray-500 truncate max-w-xs group cursor-pointer"
                                  onClick={() => startEditing(card, 'description')}
                                >
                                  {card.description ? (
                                    <div className="flex items-center">
                                      <span>{card.description}</span>
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

                          {/* Fecha de vencimiento */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {card.due_date ? (
                              <div className="flex items-center space-x-1">
                                <Calendar size={14} className="text-kodigo-primary" />
                                <span>{format(new Date(card.due_date), 'dd/MM/yyyy')}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
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

                          {/* Asignado */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {card.user ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-gradient-to-r from-kodigo-primary to-kodigo-secondary rounded-full flex items-center justify-center">
                                  <User size={12} className="text-white" />
                                </div>
                                <span className="text-sm text-gray-900">{card.user.name}</span>
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
          
          {allCards.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay tarjetas en este tablero</p>
            </div>
          )}
        </div>
      </DragDropContext>
    </div>
  );
};