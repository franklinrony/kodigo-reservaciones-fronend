import React, { useState, useRef, useEffect } from 'react';
import { BoardList, Card, CreateCardRequest } from '../../models';
import { KanbanCard } from '../cards/KanbanCard';
import { Button } from '../ui/Button';
import { Plus, MoreHorizontal, Trash2, Edit3 } from 'lucide-react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { useNotification } from '../../hooks/useNotification';

interface KanbanListProps {
  list: BoardList;
  index: number;
  onCardClick: (card: Card) => void;
  onCreateCard: (listId: number, cardData: CreateCardRequest) => Promise<void>;
  onUpdateList?: (listId: number, listData: { name: string }) => Promise<void>;
  onDeleteList?: (listId: number) => Promise<void>;
  onUpdateCard?: (cardId: number, cardData: { title?: string; description?: string }) => Promise<void>;
  onDeleteCard?: (cardId: number) => Promise<void>;
}

export const KanbanList: React.FC<KanbanListProps> = ({
  list,
  index,
  onCardClick,
  onCreateCard,
  onUpdateList,
  onDeleteList,
  onUpdateCard,
  onDeleteCard
}) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(list.name);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showNotification } = useNotification();
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const handleCreateCard = async () => {
    if (!newCardTitle.trim()) return;
    
    setLoading(true);
    try {
      await onCreateCard(list.id, { title: newCardTitle });
      setNewCardTitle('');
      setIsAddingCard(false);
      showNotification('success', 'Tarjeta creada correctamente');
    } catch (error) {
      console.error('Error creating card:', error);
      showNotification('error', error instanceof Error ? error.message : 'Error al crear la tarjeta');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTitle = async () => {
    if (!editedTitle.trim() || editedTitle === list.name) {
      setIsEditingTitle(false);
      setEditedTitle(list.name);
      return;
    }

    if (onUpdateList) {
      try {
        await onUpdateList(list.id, { name: editedTitle.trim() });
        setIsEditingTitle(false);
        showNotification('success', 'Lista actualizada correctamente');
      } catch (error) {
        console.error('Error updating list title:', error);
        showNotification('error', error instanceof Error ? error.message : 'Error al actualizar el título de la lista');
        setEditedTitle(list.name);
        setIsEditingTitle(false);
      }
    } else {
      setIsEditingTitle(false);
    }
  };

  const handleDeleteList = async () => {
    if (!onDeleteList) return;
    
    if (list.cards && list.cards.length > 0) {
      if (!confirm(`¿Estás seguro de que deseas eliminar la lista "${list.name}" y todas sus tarjetas?`)) {
        return;
      }
    }

    setIsDeleting(true);
    try {
      await onDeleteList(list.id);
      showNotification('success', 'Lista eliminada correctamente');
    } catch (error) {
      console.error('Error deleting list:', error);
      showNotification('error', error instanceof Error ? error.message : 'Error al eliminar la lista');
      setIsDeleting(false);
    }
  };

  return (
    <Draggable draggableId={`list-${list.id}`} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="bg-white rounded-lg p-4 w-80 flex-shrink-0 shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200"
        >
          <div {...provided.dragHandleProps} className="flex items-center justify-between mb-4">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveTitle();
                  }
                  if (e.key === 'Escape') {
                    setIsEditingTitle(false);
                    setEditedTitle(list.name);
                  }
                }}
                className="font-medium text-kodigo-primary bg-transparent border-0 outline-none ring-2 ring-kodigo-primary rounded px-2 py-1 -mx-2 -my-1 w-full"
              />
            ) : (
              <h3 
                className="font-medium text-kodigo-primary cursor-pointer hover:bg-kodigo-light/20 rounded px-2 py-1 -mx-2 -my-1 transition-colors"
                onClick={() => setIsEditingTitle(true)}
                title="Haz clic para editar"
              >
                {list.name}
              </h3>
            )}
            <div className="flex items-center space-x-1">
              <span className="text-sm text-kodigo-secondary font-medium bg-kodigo-secondary/10 px-2 py-1 rounded-full">
                {list.cards?.length || 0}
              </span>
              <div className="relative" ref={menuRef}>
                <button 
                  className="p-1 hover:bg-kodigo-light/20 rounded transition-colors duration-200"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <MoreHorizontal size={16} className="text-kodigo-primary" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                    <button
                      onClick={() => {
                        setIsEditingTitle(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-kodigo-light/20 flex items-center space-x-2 text-kodigo-primary"
                    >
                      <Edit3 size={14} />
                      <span>Editar título</span>
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteList();
                        setShowMenu(false);
                      }}
                      disabled={isDeleting}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      <span>{isDeleting ? 'Eliminando...' : 'Eliminar lista'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Droppable droppableId={list.id.toString()} type="CARD">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`min-h-20 ${
                  snapshot.isDraggingOver ? 'bg-kodigo-light/30 rounded-md' : ''
                }`}
              >
                {list.cards?.sort((a, b) => a.position - b.position).map((card, cardIndex) => (
                  <KanbanCard
                    key={card.id}
                    card={card}
                    index={cardIndex}
                    onClick={() => onCardClick(card)}
                    onUpdateCard={onUpdateCard}
                    onDeleteCard={onDeleteCard}
                  />
                ))}
                {provided.placeholder}
                
                {isAddingCard ? (
                  <div className="bg-white rounded-lg shadow-sm border border-kodigo-primary/20 p-4 mb-3">
                    <textarea
                      value={newCardTitle}
                      onChange={(e) => setNewCardTitle(e.target.value)}
                      placeholder="Ingresa un título para esta tarjeta..."
                      className="w-full resize-none border-0 focus:ring-0 p-0 text-sm focus:outline-none"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex items-center space-x-2 mt-2">
                      <Button
                        size="sm"
                        onClick={handleCreateCard}
                        loading={loading}
                        variant="gradient"
                      >
                        Agregar tarjeta
                      </Button>
                      <button
                        onClick={() => {
                          setIsAddingCard(false);
                          setNewCardTitle('');
                        }}
                        className="text-gray-500 hover:text-kodigo-primary transition-colors duration-200"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingCard(true)}
                    className="flex items-center space-x-2 text-kodigo-primary hover:text-kodigo-dark w-full p-3 rounded-lg hover:bg-kodigo-light/20 transition-all duration-200"
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