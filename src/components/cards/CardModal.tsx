import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, User, Save, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Modal } from '@/components/ui/Modal';
import { Card, UpdateCardRequest, Comment, BoardCollaborator } from '@/models';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { commentService } from '@/services/commentService';
import { useAuth } from '@/contexts/AuthContext';

interface CardModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCard: (cardId: number, cardData: UpdateCardRequest) => Promise<void>;
  boardLists?: Array<{ id: number; name: string }>;
  boardCollaborators?: BoardCollaborator[]; // Colaboradores del tablero
  boardOwnerId?: number; // ID del propietario del tablero
}

export const CardModal: React.FC<CardModalProps> = ({
  card,
  isOpen,
  onClose,
  onUpdateCard,
  boardLists = [],
  boardCollaborators = [],
  boardOwnerId
}) => {
  const { user: currentUser } = useAuth();

  // Calcular permisos del usuario actual
  const getCurrentUserRole = useCallback(() => {
    if (!currentUser || !boardOwnerId) return 'viewer';
    
    // Si es el propietario del board
    if (currentUser.id === boardOwnerId) {
      return 'admin';
    }
    
    // Buscar en colaboradores
    const collaboration = boardCollaborators.find(collab => collab.user_id === currentUser.id);
    return collaboration?.role || 'viewer';
  }, [currentUser, boardOwnerId, boardCollaborators]);

  const userRole = getCurrentUserRole();
  const canEdit = userRole === 'admin' || userRole === 'editor';

  // Obtener lista de usuarios disponibles para asignar como responsables
  const getAvailableUsers = useCallback((): Array<{ id: number; name: string; email: string }> => {
    const users: Array<{ id: number; name: string; email: string }> = [];
    
    // Agregar propietario si existe
    if (boardOwnerId) {
      // Necesitaríamos la información completa del propietario
      // Por ahora solo agregamos los colaboradores
    }
    
    // Agregar colaboradores
    boardCollaborators.forEach(collab => {
      if (collab.user) {
        users.push({
          id: collab.user.id,
          name: collab.user.name,
          email: collab.user.email
        });
      }
    });
    
    return users;
  }, [boardOwnerId, boardCollaborators]);

  const availableUsers = getAvailableUsers();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(''); 
  const [assignedTo, setAssignedTo] = useState('');
  const [responsible, setResponsible] = useState('');
  const [responsibleUserId, setResponsibleUserId] = useState<number | null>(null); // ID del usuario responsable
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  
  // Estados para manejo de cambios no guardados
  const [originalData, setOriginalData] = useState<{
    title: string;
    description: string;
    dueDate: string;
    assignedTo: string;
    responsible: string;
    selectedListId: number | null;
  } | null>(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!card) return;
    
    setCommentsLoading(true);
    try {
      const data = await commentService.getComments(card.id);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  }, [card]);

  useEffect(() => {
    if (card) {
      const cardData = {
        title: card.title,
        description: card.description || '',
        dueDate: card.due_date || '',
        assignedTo: card.assigned_to || '',
        responsible: card.responsible || '',
        selectedListId: card.board_list_id
      };
      
      setTitle(cardData.title);
      setDescription(cardData.description);
      setDueDate(cardData.dueDate);
      setAssignedTo(cardData.assignedTo);
      setResponsible(cardData.responsible);
      
      // Intentar encontrar el ID del usuario responsable basado en el nombre
      const responsibleUser = availableUsers.find(user => user.name === cardData.responsible);
      setResponsibleUserId(responsibleUser?.id || null);
      
      setSelectedListId(cardData.selectedListId);
      setOriginalData(cardData);
      fetchComments();
    }
  }, [card, fetchComments, availableUsers]);

  const handleSave = async () => {
    if (!card) return;
    
    setLoading(true);
    try {
      // Obtener el nombre del usuario responsable seleccionado
      const selectedResponsibleUser = availableUsers.find(user => user.id === responsibleUserId);
      const responsibleName = selectedResponsibleUser?.name || '';
      
      await onUpdateCard(card.id, {
        title,
        description,
        due_date: dueDate || undefined,
        assigned_to: assignedTo || undefined,
        responsible: responsibleName || undefined,
        list_id: selectedListId !== card.board_list_id && selectedListId !== null ? selectedListId : undefined
      });
      
      // Actualizar datos originales después de guardar exitosamente
      setOriginalData({
        title,
        description,
        dueDate,
        assignedTo,
        responsible: responsibleName,
        selectedListId
      });
    } catch (error) {
      console.error('Error updating card:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para detectar si hay cambios no guardados
  const hasUnsavedChanges = useCallback(() => {
    if (!originalData) return false;
    
    // Obtener el ID del responsable original
    const originalResponsibleUser = availableUsers.find(user => user.name === originalData.responsible);
    const originalResponsibleUserId = originalResponsibleUser?.id || null;
    
    return (
      title !== originalData.title ||
      description !== originalData.description ||
      dueDate !== originalData.dueDate ||
      assignedTo !== originalData.assignedTo ||
      responsibleUserId !== originalResponsibleUserId ||
      selectedListId !== originalData.selectedListId
    );
  }, [title, description, dueDate, assignedTo, responsibleUserId, selectedListId, originalData, availableUsers]);

  // Función para manejar el cambio de responsable
  const handleResponsibleChange = (userId: string) => {
    const selectedUserId = userId ? parseInt(userId) : null;
    setResponsibleUserId(selectedUserId);
    
    const selectedUser = availableUsers.find(user => user.id === selectedUserId);
    setResponsible(selectedUser?.name || '');
  };

  // Función para manejar el intento de cierre
  const handleCloseAttempt = useCallback(() => {
    if (hasUnsavedChanges()) {
      setShowUnsavedWarning(true);
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, onClose]);

  // Función para confirmar el cierre descartando cambios
  const handleConfirmClose = useCallback(() => {
    setShowUnsavedWarning(false);
    onClose();
  }, [onClose]);

  // Función para cancelar el cierre
  const handleCancelClose = useCallback(() => {
    setShowUnsavedWarning(false);
  }, []);

  // Manejar tecla ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleCloseAttempt();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleCloseAttempt]);

  const handleAddComment = async () => {
    if (!card || !newComment.trim()) return;
    
    try {
      await commentService.createComment(card.id, { content: newComment });
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (!card) return null;

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={handleCloseAttempt} 
        size="xl" 
        title="Detalles de la Tarjeta"
      >
        <div className="space-y-4">
          {/* Información de permisos */}
          {!canEdit && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Modo solo lectura:</strong> Tienes rol de "{userRole}" en este tablero. 
                Solo puedes ver el contenido, no editarlo.
              </p>
            </div>
          )}

          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!canEdit}
                className="text-lg font-semibold border-0 px-0 focus:ring-0 w-full disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Título de la tarjeta"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {hasUnsavedChanges() && (
                <span className="text-xs text-amber-600 font-medium">
                  • Cambios sin guardar
                </span>
              )}
              {canEdit && (
                <Button onClick={handleSave} loading={loading} size="sm">
                  <Save size={16} className="mr-1" />
                  Guardar
                </Button>
              )}
            </div>
          </div>

        {/* Card Details */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
          <div className="xl:col-span-2 space-y-4 lg:space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!canEdit}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-kodigo-primary focus:border-kodigo-primary sm:text-sm resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                rows={3}
                placeholder={canEdit ? "Añade una descripción más detallada..." : "Sin descripción"}
              />
              {!canEdit && (
                <p className="text-xs text-gray-500 mt-1">
                  Solo los administradores y editores pueden editar la descripción
                </p>
              )}
            </div>

            {/* Comments */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <MessageCircle size={16} className="mr-2 text-kodigo-primary" />
                Comentarios
              </h4>
              
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                {commentsLoading ? (
                  <div className="text-center py-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-kodigo-primary mx-auto mb-1"></div>
                    <p className="text-xs text-gray-500">Cargando comentarios...</p>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-4 text-gray-400">
                    <MessageCircle size={24} className="mx-auto mb-1 opacity-50" />
                    <p className="text-xs">No hay comentarios aún.</p>
                    <p className="text-xs opacity-75">Sé el primero en comentar</p>
                  </div>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="bg-gray-50 rounded-md p-2 border-l-2 border-kodigo-primary/20">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-5 h-5 bg-gradient-to-r from-kodigo-primary to-kodigo-secondary rounded-full flex items-center justify-center shrink-0">
                          <User size={10} className="text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                          {comment.user?.name || 'Usuario'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(comment.created_at), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={!canEdit}
                  placeholder={canEdit ? "Escribe un comentario..." : "Solo editores pueden comentar"}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:ring-kodigo-primary focus:border-kodigo-primary text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  onKeyPress={(e) => e.key === 'Enter' && canEdit && handleAddComment()}
                />
                {canEdit && (
                  <Button onClick={handleAddComment} size="sm" className="shrink-0">
                    Comentar
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="xl:col-span-1 space-y-3 lg:space-y-4">
            {/* Lista */}
            {boardLists.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Lista
                </label>
                <select
                  value={selectedListId || ''}
                  onChange={(e) => setSelectedListId(e.target.value ? parseInt(e.target.value) : null)}
                  disabled={!canEdit}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-kodigo-primary focus:border-kodigo-primary text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  {boardLists.map(list => (
                    <option key={list.id} value={list.id}>
                      {list.name}
                    </option>
                  ))}
                </select>
                {!canEdit && (
                  <p className="text-xs text-gray-500 mt-1">
                    Solo los administradores y editores pueden mover tarjetas
                  </p>
                )}
              </div>
            )}

            {/* Asignado por */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Asignado por
              </label>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-kodigo-primary to-kodigo-secondary rounded-full flex items-center justify-center shrink-0">
                  <User size={12} className="text-white" />
                </div>
                <span className="text-sm text-gray-700">
                  {card?.user?.name || assignedTo || 'Usuario'}
                </span>
              </div>
            </div>

            {/* Responsable */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Responsable
              </label>
              <select
                value={responsibleUserId || ''}
                onChange={(e) => handleResponsibleChange(e.target.value)}
                disabled={!canEdit}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-kodigo-primary focus:border-kodigo-primary text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Seleccionar responsable</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              {!canEdit && (
                <p className="text-xs text-gray-500 mt-1">
                  Solo los administradores y editores pueden cambiar el responsable
                </p>
              )}
            </div>

            {/* Due Date */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="flex items-center text-xs font-medium text-gray-700 mb-2">
                <Calendar size={14} className="mr-1 text-kodigo-primary" />
                Fecha de vencimiento
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={!canEdit}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-kodigo-primary focus:border-kodigo-primary text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {!canEdit && (
                <p className="text-xs text-gray-500 mt-1">
                  Solo los administradores y editores pueden cambiar la fecha
                </p>
              )}
            </div>

            {/* Labels */}
            {card.labels && card.labels.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Etiquetas
                </label>
                <div className="flex flex-wrap gap-1">
                  {card.labels.map(label => (
                    <span
                      key={label.id}
                      className="px-2 py-1 text-xs font-medium rounded-full border"
                      style={{
                        backgroundColor: label.color + '15',
                        borderColor: label.color + '40',
                        color: label.color
                      }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Created by */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Creado por
              </label>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-kodigo-primary to-kodigo-secondary rounded-full flex items-center justify-center shrink-0">
                  <User size={12} className="text-white" />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-900">
                    {card.user?.name || 'Usuario'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {card.created_at && format(new Date(card.created_at), 'dd/MM/yyyy')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>

    {/* Modal de advertencia para cambios no guardados */}
    <Modal 
      isOpen={showUnsavedWarning} 
      onClose={handleCancelClose} 
      size="md"
      title="¿Descartar cambios?"
    >
      <div className="space-y-4">
        <p className="text-gray-700">
          Tienes cambios sin guardar. Si cierras ahora, se perderán todos los cambios realizados.
        </p>
        <div className="flex justify-end space-x-3">
          <Button 
            onClick={handleCancelClose} 
            variant="ghost"
            size="sm"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmClose} 
            variant="danger"
            size="sm"
          >
            Descartar cambios
          </Button>
        </div>
      </div>
    </Modal>
  </>
  );
};