import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, User as UserIcon, Save, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Modal } from '@/components/ui/Modal';
import { Card, UpdateCardRequest, Comment, User } from '@/models';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { commentService } from '@/services/commentService';
import { userService } from '@/services/userService';
import { labelService } from '@/services/labelService';
import { useAuth } from '@/contexts/AuthContext';
import { useBoardPermissions } from '@/hooks/useBoardPermissions';

interface CardModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCard: (cardId: number, cardData: UpdateCardRequest) => Promise<void>;
  boardLists?: Array<{ id: number; name: string }>;
  boardId: number; // ID del tablero para consultar usuarios
}

export const CardModal: React.FC<CardModalProps> = ({
  card,
  isOpen,
  onClose,
  onUpdateCard,
  boardLists = [],
  boardId
}) => {
  const { user: currentUser } = useAuth();
  const { canEdit, boardUsers } = useBoardPermissions(boardId);

  // Estado para las labels globales
  const [globalLabels, setGlobalLabels] = useState<Array<{ id: number; name: string; color: string }>>([]);

  // Estados para los datos de usuarios
  const [cardCreator, setCardCreator] = useState<User | null>(null);
  const [assignedByUser, setAssignedByUser] = useState<User | null>(null);

  // Cargar labels globales al montar el componente
  useEffect(() => {
    const loadGlobalLabels = async () => {
      try {
        const labels = await labelService.getAllLabels();
        setGlobalLabels(labels);
      } catch (error) {
        console.error('Error loading global labels:', error);
      }
    };
    loadGlobalLabels();
  }, []);

  // Función para convertir label_id a prioridad
  const getPriorityFromLabelId = useCallback((labelId: number): 'baja' | 'media' | 'alta' | 'extremo' => {
    const label = globalLabels.find(l => l.id === labelId);
    if (!label) return 'media';

    const labelName = label.name.toLowerCase();
    if (labelName.includes('bajo') || labelName.includes('baja')) return 'baja';
    if (labelName.includes('medio') || labelName.includes('media')) return 'media';
    if (labelName.includes('alto') || labelName.includes('alta')) return 'alta';
    if (labelName.includes('extremo')) return 'extremo';
    
    return 'media'; // fallback
  }, [globalLabels]);

  // Función para obtener la prioridad actual de la tarjeta
  const getCurrentCardPriority = useCallback((): 'baja' | 'media' | 'alta' | 'extremo' => {
    if (!card?.label_ids || card.label_ids.length === 0) return 'media';
    
    // Tomar el primer label_id (asumiendo que solo hay uno para prioridad)
    const labelId = card.label_ids[0];
    return getPriorityFromLabelId(labelId);
  }, [card, getPriorityFromLabelId]);

  // Calcular permisos del usuario actual usando el hook
  const userCanEdit = canEdit;

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

  // Función para cargar la información del usuario que asignó la tarjeta
  const fetchAssignedByUser = useCallback(async (userId: number) => {
    try {
      const user = await userService.getUserById(userId);
      setAssignedByUser(user);
    } catch (error) {
      console.error('Error fetching assigned by user:', error);
      setAssignedByUser(null);
    }
  }, []);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(''); 
  const [assignedTo, setAssignedTo] = useState('');
  const [responsibleUserId, setResponsibleUserId] = useState<number | null>(null); // ID del usuario responsable
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [progressPercentage, setProgressPercentage] = useState(0); // Progreso de la tarea (0-100)
  const [priority, setPriority] = useState<'baja' | 'media' | 'alta' | 'extremo'>('media'); // Prioridad de la tarea
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para manejo de cambios no guardados
  const [originalData, setOriginalData] = useState<{
    title: string;
    description: string;
    dueDate: string;
    assignedTo: string;
    responsibleUserId: number | null;
    selectedListId: number | null;
    progressPercentage: number;
    priority: 'baja' | 'media' | 'alta' | 'extremo';
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
      setPriority('media');
      setOriginalData(null);
      setComments([]);
      setCardCreator(null);
      setIsLoading(false);
      return;
    }

    // Iniciar carga
    setIsLoading(true);

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
      progressPercentage: initialProgress,
      priority: getCurrentCardPriority()
    };
    
    setTitle(cardData.title);
    setDescription(cardData.description);
    setDueDate(cardData.dueDate);
    setAssignedTo(cardData.assignedTo);
    setSelectedListId(cardData.selectedListId);
    setProgressPercentage(initialProgress);
    setPriority(cardData.priority);
    // No establecer originalData aquí, se hará cuando se carguen los usuarios

    // Cargar datos asíncronos
    fetchComments(card.id);
    if (card.user_id) {
      fetchCardCreator(card.user_id);
    }
    
    // Cargar información del usuario que asignó la tarjeta si existe
    if (card.assigned_by) {
      fetchAssignedByUser(card.assigned_by);
    } else {
      setAssignedByUser(null);
    }
  }, [card, boardId, fetchComments, fetchCardCreator, fetchAssignedByUser, getCurrentCardPriority]);

  // Efecto para controlar el estado de carga general
  useEffect(() => {
    if (!card) {
      setIsLoading(false);
      return;
    }

    // Verificar si todos los datos necesarios están cargados
    const commentsLoaded = !commentsLoading;
    const creatorLoaded = !card.user_id || cardCreator !== null;
    const boardUsersLoaded = boardUsers.length > 0;

    // Si todos los datos están cargados, terminar la carga
    if (commentsLoaded && creatorLoaded && boardUsersLoaded) {
      setIsLoading(false);
    }
  }, [card, commentsLoading, cardCreator, boardUsers]);

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
      
      // Establecer originalData solo si no existe (primera carga)
      if (!originalData) {
        setOriginalData({
          title: card.title || '',
          description: card.description || '',
          dueDate: card.due_date ? card.due_date.split('T')[0] : '',
          assignedTo: card.assigned_to || '',
          responsibleUserId: newResponsibleUserId,
          selectedListId: card.board_list_id,
          progressPercentage: card.progress_percentage || 0,
          priority: card.priority || 'media'
        });
      }
    }
  }, [card, boardUsers, originalData]);

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
        
        // Si se está asignando un responsable (y hay usuario actual), 
        // incluir assigned_by solo si no había responsable antes o si cambió
        if (responsibleUserId && currentUser) {
          // Solo asignar assigned_by si:
          // 1. No había responsable antes (primera asignación), O
          // 2. Se está cambiando el responsable
          if (!originalData?.responsibleUserId || responsibleUserId !== originalData.responsibleUserId) {
            payload.assigned_by = currentUser.id;
          }
        }
      }

      if (progressPercentage !== originalData?.progressPercentage) {
        payload.progress_percentage = progressPercentage;
      }

      if (selectedListId !== originalData?.selectedListId && selectedListId !== null) {
        payload.list_id = selectedListId;
      }

      if (priority !== originalData?.priority) {
        // Convertir la prioridad seleccionada al correspondiente label_id
        const priorityLabelId = getLabelIdForPriority(priority);
        if (priorityLabelId) {
          payload.label_ids = [priorityLabelId];
        }
      }

      console.log('CardModal - Current values:', {
        title,
        description,
        dueDate,
        responsibleUserId,
        progressPercentage,
        selectedListId,
        priority
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
        progressPercentage,
        priority
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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-kodigo-primary"></div>
              <span className="text-gray-600">Cargando detalles de la tarjeta...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Información de permisos */}
            {!userCanEdit && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Modo solo lectura:</strong> Tienes permisos limitados en este tablero.
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
                disabled={!userCanEdit}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-kodigo-primary focus:border-kodigo-primary sm:text-sm resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                rows={3}
                placeholder={userCanEdit ? "Añade una descripción más detallada..." : "Sin descripción"}
              />
              {!userCanEdit && (
                <p className="text-xs text-gray-500 mt-1">
                  Solo los propietarios, administradores y editores pueden editar la descripción
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
                    disabled={!userCanEdit}
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
                    disabled={!userCanEdit}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-kodigo-primary focus:border-kodigo-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
              </div>
              {!userCanEdit && (
                <p className="text-xs text-gray-500 mt-1">
                  Solo los propietarios, administradores y editores pueden cambiar el progreso
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
                  disabled={!userCanEdit}
                  placeholder={userCanEdit ? "Escribe un comentario..." : "Solo editores pueden comentar"}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:ring-kodigo-primary focus:border-kodigo-primary text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  onKeyPress={(e) => e.key === 'Enter' && userCanEdit && handleAddComment()}
                />
                {userCanEdit && (
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
                  disabled={!userCanEdit}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-kodigo-primary focus:border-kodigo-primary text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  {boardLists.map(list => (
                    <option key={list.id} value={list.id}>
                      {list.name}
                    </option>
                  ))}
                </select>
                {!userCanEdit && (
                  <p className="text-xs text-gray-500 mt-1">
                    Solo los propietarios, administradores y editores pueden mover tarjetas
                  </p>
                )}
              </div>
            )}

            {/* Asignado por - Solo mostrar si existe assigned_by */}
            {card.assigned_by && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Asignado por
                </label>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-kodigo-primary to-kodigo-secondary rounded-full flex items-center justify-center shrink-0">
                    <UserIcon size={12} className="text-white" />
                  </div>
                  <span className="text-sm text-gray-700">
                    {assignedByUser?.name || 'Cargando...'}
                  </span>
                </div>
              </div>
            )}

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
                  Solo los propietarios, administradores y editores pueden cambiar el responsable
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
                  Solo los propietarios, administradores y editores pueden cambiar la fecha
                </p>
              )}
            </div>

            {/* Priority Selector */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Prioridad
              </label>
              {userCanEdit ? (
                <select
                  value={priority}
                  onChange={(e) => {
                    const newPriority = e.target.value as 'baja' | 'media' | 'alta' | 'extremo';
                    setPriority(newPriority);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-kodigo-primary focus:border-transparent"
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="extremo">Extremo</option>
                </select>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    priority === 'extremo' ? 'bg-purple-100 text-purple-800' :
                    priority === 'alta' ? 'bg-red-100 text-red-800' :
                    priority === 'media' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {priority === 'extremo' ? 'Extremo' :
                     priority === 'alta' ? 'Alta' :
                     priority === 'media' ? 'Media' : 'Baja'}
                  </span>
                </div>
              )}
              {!userCanEdit && (
                <p className="text-xs text-gray-500 mt-1">
                  Solo los propietarios, administradores y editores pueden cambiar la prioridad
                </p>
              )}
            </div>

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
        )}
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