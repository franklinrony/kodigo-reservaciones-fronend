import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, User as UserIcon, Save, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Modal } from '@/components/ui/Modal';
import { Card, UpdateCardRequest, Comment, User } from '@/models';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { commentService } from '@/services/commentService';
import { userService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';

interface CardModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCard: (cardId: number, cardData: UpdateCardRequest) => Promise<void>;
  boardLists?: Array<{ id: number; name: string }>;
  boardId: number; // ID del tablero para consultar usuarios
  boardOwnerId?: number; // ID del propietario del tablero
}

export const CardModal: React.FC<CardModalProps> = ({
  card,
  isOpen,
  onClose,
  onUpdateCard,
  boardLists = [],
  boardId,
  boardOwnerId
}) => {
  const { user: currentUser } = useAuth();

  // Estados para los datos de usuarios
  const [cardCreator, setCardCreator] = useState<User | null>(null);
  const [boardUsers, setBoardUsers] = useState<User[]>([]);

  // Calcular permisos del usuario actual (simplificado)
  const getCurrentUserRole = useCallback(() => {
    if (!currentUser || !boardOwnerId) return 'viewer';
    
    // Si es el propietario del board
    if (currentUser.id === boardOwnerId) {
      return 'admin';
    }
    
    // Por ahora asumimos editor para usuarios autenticados
    return 'editor';
  }, [currentUser, boardOwnerId]);

  const userRole = getCurrentUserRole();
  const canEdit = userRole === 'admin' || userRole === 'editor';

  // Función para cargar la información del creador de la tarjeta
  const fetchCardCreator = useCallback(async (userId: number) => {
    try {
      const user = await userService.getUserById(userId);
      setCardCreator(user);
    } catch (error) {
      console.error('Error fetching card creator:', error);
      setCardCreator(null);
    }
  }, []);

  // Función para cargar los usuarios del tablero
  const fetchBoardUsers = useCallback(async () => {
    if (!boardId) return;
    
    try {
      const users = await userService.getBoardUsers(boardId);
      setBoardUsers(users);
      console.log('CardModal - Board users loaded:', users);
    } catch (error) {
      console.error('Error fetching board users:', error);
      setBoardUsers([]);
    }
  }, [boardId]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(''); 
  const [assignedTo, setAssignedTo] = useState('');
  const [responsibleUserId, setResponsibleUserId] = useState<number | null>(null); // ID del usuario responsable
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [progressPercentage, setProgressPercentage] = useState(0); // Progreso de la tarea (0-100)
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
    responsibleUserId: number | null;
    selectedListId: number | null;
    progressPercentage: number;
  } | null>(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const fetchComments = useCallback(async (cardId: number) => {
    setCommentsLoading(true);
    try {
      const data = await commentService.getComments(cardId);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]); // Resetear comentarios en caso de error
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  // Efecto principal para inicializar datos cuando cambia la card
  useEffect(() => {
    if (!card) {
      // Resetear estados cuando no hay card
      setTitle('');
      setDescription('');
      setDueDate('');
      setAssignedTo('');
      setSelectedListId(null);
      setResponsibleUserId(null);
      setProgressPercentage(0);
      setOriginalData(null);
      setComments([]);
      setCardCreator(null);
      return;
    }

    console.log('CardModal - Card data:', card);
    console.log('CardModal - card.user_id:', card.user_id);

    const initialProgress = card.progress_percentage || 0;

    const cardData = {
      title: card.title,
      description: card.description || '',
      dueDate: card.due_date ? card.due_date.split('T')[0] : '', // Convertir ISO a yyyy-MM-dd
      assignedTo: card.assigned_to || '',
      responsibleUserId: null, // Se establecerá cuando se carguen los usuarios
      selectedListId: card.board_list_id,
      progressPercentage: initialProgress
    };
    
    setTitle(cardData.title);
    setDescription(cardData.description);
    setDueDate(cardData.dueDate);
    setAssignedTo(cardData.assignedTo);
    setSelectedListId(cardData.selectedListId);
    setProgressPercentage(initialProgress);
    setOriginalData(cardData);

    // Cargar comentarios y datos del usuario creador
    fetchComments(card.id);
    if (card.user_id) {
      fetchCardCreator(card.user_id);
    }
  }, [card, fetchComments, fetchCardCreator]);

  // Efecto para cargar usuarios del tablero cuando se abre el modal
  useEffect(() => {
    if (isOpen && boardId) {
      fetchBoardUsers();
    }
  }, [isOpen, boardId, fetchBoardUsers]);

  // Efecto para establecer el responsable cuando se cargan los usuarios del tablero
  useEffect(() => {
    if (card && boardUsers.length > 0) {
      console.log('Card data:', card);
      console.log('Board users:', boardUsers);
      
      let responsibleUser = null;
      let newResponsibleUserId = null;

      // 1. Buscar por assigned_user_id si existe (campo correcto del backend)
      if (card.assigned_user_id) {
        responsibleUser = boardUsers.find(user => user.id === card.assigned_user_id);
        console.log('Found by assigned_user_id:', responsibleUser);
      }
      
      // 2. Si no se encontró, buscar por assigned_to (nombre)
      if (!responsibleUser && card.assigned_to) {
        responsibleUser = boardUsers.find(user => user.name === card.assigned_to);
        console.log('Found by assigned_to:', responsibleUser);
      }
      
      // 3. Si no se encontró, buscar por responsible (nombre)
      if (!responsibleUser && card.responsible) {
        responsibleUser = boardUsers.find(user => user.name === card.responsible);
        console.log('Found by responsible:', responsibleUser);
      }

      newResponsibleUserId = responsibleUser?.id || null;
      console.log('Setting responsibleUserId to:', newResponsibleUserId);
      
      // Solo actualizar si es diferente (inicialización)
      setResponsibleUserId(newResponsibleUserId);
      
      // Actualizar también originalData para la primera carga
      setOriginalData({
        title: card.title || '',
        description: card.description || '',
        dueDate: card.due_date || '',
        assignedTo: card.assigned_to || '',
        responsibleUserId: newResponsibleUserId,
        selectedListId: card.board_list_id,
        progressPercentage: card.progress_percentage || 0
      });
    }
  }, [card, boardUsers]); // Removido responsibleUserId de las dependencias

  const handleSave = async () => {
    if (!card) return;
    
    setLoading(true);
    try {
      // Construir payload limpio solo con campos que se pueden actualizar
      const payload: UpdateCardRequest = {};

      // Solo incluir campos que han cambiado o que tienen valor
      if (title !== originalData?.title) {
        payload.title = title;
      }
      
      if (description !== originalData?.description) {
        payload.description = description || undefined;
      }

      if (dueDate !== originalData?.dueDate) {
        payload.due_date = dueDate || undefined;
      }

      if (responsibleUserId !== originalData?.responsibleUserId) {
        payload.assigned_user_id = responsibleUserId || undefined;
      }

      if (progressPercentage !== originalData?.progressPercentage) {
        payload.progress_percentage = progressPercentage;
      }

      if (selectedListId !== originalData?.selectedListId && selectedListId !== null) {
        payload.list_id = selectedListId;
      }

      // Si la card tiene una etiqueta de prioridad, incluirla como array
      if (card.labels && card.labels.length > 0) {
        // Por ahora solo enviamos la primera etiqueta como prioridad
        payload.label_ids = [card.labels[0].id];
      }

      console.log('CardModal - Current values:', {
        title,
        description,
        dueDate,
        responsibleUserId,
        progressPercentage,
        selectedListId
      });
      console.log('CardModal - Original data:', originalData);
      console.log('CardModal - Final payload:', payload);
      
      await onUpdateCard(card.id, payload);
      
      // Actualizar datos originales después de guardar exitosamente
      setOriginalData({
        title,
        description,
        dueDate,
        assignedTo,
        responsibleUserId,
        selectedListId,
        progressPercentage
      });

      // Cerrar el modal automáticamente después de guardar exitosamente
      setTimeout(() => {
        onClose();
      }, 800); // Delay más largo para ver el resultado
    } catch (error) {
      console.error('Error updating card:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para detectar si hay cambios no guardados
  const hasUnsavedChanges = useCallback(() => {
    if (!originalData) return false;
    
    return (
      title !== originalData.title ||
      description !== originalData.description ||
      dueDate !== originalData.dueDate ||
      assignedTo !== originalData.assignedTo ||
      responsibleUserId !== originalData.responsibleUserId ||
      selectedListId !== originalData.selectedListId ||
      progressPercentage !== originalData.progressPercentage
    );
  }, [title, description, dueDate, assignedTo, responsibleUserId, selectedListId, progressPercentage, originalData]);

  // Función para manejar el cambio de responsable
  const handleResponsibleChange = (userId: string) => {
    const selectedUserId = userId ? parseInt(userId) : null;
    setResponsibleUserId(selectedUserId);
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
      fetchComments(card.id);
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

            {/* Progress */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progreso de la tarea
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progressPercentage}
                    onChange={(e) => setProgressPercentage(parseInt(e.target.value))}
                    disabled={!canEdit}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={progressPercentage}
                    onChange={(e) => setProgressPercentage(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    disabled={!canEdit}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-kodigo-primary focus:border-kodigo-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
              </div>
              {!canEdit && (
                <p className="text-xs text-gray-500 mt-1">
                  Solo los administradores y editores pueden cambiar el progreso
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
                          <UserIcon size={10} className="text-white" />
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
                  <UserIcon size={12} className="text-white" />
                </div>
                <span className="text-sm text-gray-700">
                  {cardCreator?.name || assignedTo || 'Usuario'}
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
                {boardUsers.map(user => (
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
                  <UserIcon size={12} className="text-white" />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-900">
                    {cardCreator?.name || 'Usuario'}
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