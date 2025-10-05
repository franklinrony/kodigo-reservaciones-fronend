import React, { useState, useEffect, useCallback } from 'react';
import { Search, User, Plus, X, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User as UserType } from '@/models';
import { userService } from '@/services/userService';
import { boardService } from '@/services/boardService';
import { useNotification } from '@/hooks/useNotification';
import { useBoardPermissions } from '@/hooks/useBoardPermissions';

interface CollaboratorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: number;
  boardName: string;
  boardOwnerId: number;
  currentUserId: number;
  onCollaboratorsUpdate: () => void;
}

interface UserWithRole extends UserType {
  role?: 'viewer' | 'editor' | 'admin' | 'owner';
  isCollaborator?: boolean;
}

export const CollaboratorsModal: React.FC<CollaboratorsModalProps> = ({
  isOpen,
  onClose,
  boardId,
  boardName,
  boardOwnerId,
  currentUserId,
  onCollaboratorsUpdate
}) => {
  const { showNotification } = useNotification();
  const { canManageCollaborators } = useBoardPermissions(boardId);

  // Estados
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<UserWithRole[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedRole, setSelectedRole] = useState<'viewer' | 'editor' | 'admin'>('editor');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [addingUsers, setAddingUsers] = useState(false);

  // Cargar usuarios y colaboradores cuando se abre el modal
  const loadData = useCallback(async () => {
    setLoadingUsers(true);
    try {
      // Cargar todos los usuarios y colaboradores en paralelo
      const [usersResponse, collaboratorsResponse] = await Promise.all([
        userService.getAllUsers(),
        userService.getBoardUsers(boardId)
      ]);

      // Marcar cuáles usuarios ya son colaboradores
      const usersWithRoles: UserWithRole[] = usersResponse.map(user => {
        const isCollaborator = collaboratorsResponse.some(col => col.id === user.id);
        const isOwner = user.id === boardOwnerId;
        
        return {
          ...user,
          role: isOwner ? 'owner' : (isCollaborator ? 'editor' : undefined),
          isCollaborator: isCollaborator || isOwner
        };
      });

      setAllUsers(usersWithRoles);
    } catch (error) {
      console.error('Error loading collaborators data:', error);
      showNotification('error', 'Error al cargar los datos de colaboradores');
    } finally {
      setLoadingUsers(false);
    }
  }, [boardId, boardOwnerId, showNotification]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  // Filtrar usuarios basado en el término de búsqueda
  const filteredUsers = allUsers.filter(user => {
    if (!searchTerm.trim()) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  // Usuarios que no son colaboradores (disponibles para agregar)
  const availableUsers = filteredUsers.filter(user => !user.isCollaborator);

  // Usuarios que ya son colaboradores
  const existingCollaborators = filteredUsers.filter(user => user.isCollaborator);

  // Manejar selección/deselección de usuarios
  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Agregar colaboradores seleccionados
  const addSelectedCollaborators = async () => {
    if (selectedUsers.length === 0) return;

    setAddingUsers(true);
    try {
      const promises = selectedUsers.map(userId =>
        boardService.addCollaborator(boardId.toString(), userId.toString(), selectedRole)
      );

      await Promise.all(promises);

      showNotification('success', `${selectedUsers.length} colaborador(es) agregado(s) correctamente`);
      setSelectedUsers([]);

      // Recargar datos
      await loadData();
      onCollaboratorsUpdate();
    } catch (error) {
      console.error('Error adding collaborators:', error);

      // Si es un error de usuario ya existente, mostrar mensaje específico
      if ((error as { response?: { status?: number } }).response?.status === 422) {
        showNotification('error', 'Uno o más usuarios ya son colaboradores de este tablero');
      } else {
        showNotification('error', 'Error al agregar colaboradores');
      }
    } finally {
      setAddingUsers(false);
    }
  };

  // Cambiar rol de un colaborador
  const changeCollaboratorRole = async (userId: number, newRole: 'viewer' | 'editor' | 'admin') => {
    try {
      await boardService.updateCollaborator(boardId.toString(), userId.toString(), newRole);

      showNotification('success', 'Rol actualizado correctamente');

      // Actualizar estado local en allUsers
      setAllUsers(prev =>
        prev.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      onCollaboratorsUpdate();
    } catch (error) {
      console.error('Error updating collaborator role:', error);
      showNotification('error', 'Error al actualizar el rol del colaborador');
    }
  };

  // Remover colaborador
  const removeCollaborator = async (userId: number) => {
    if (!confirm('¿Estás seguro de que deseas remover a este colaborador del tablero?')) {
      return;
    }

    try {
      await boardService.removeCollaborator(boardId, userId);

      showNotification('success', 'Colaborador removido correctamente');

      // Actualizar estado local en allUsers
      setAllUsers(prev =>
        prev.map(user =>
          user.id === userId
            ? { ...user, isCollaborator: false, role: undefined }
            : user
        )
      );

      onCollaboratorsUpdate();
    } catch (error) {
      console.error('Error removing collaborator:', error);
      showNotification('error', 'Error al remover colaborador');
    }
  };

  // Obtener color del rol
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-yellow-100 text-yellow-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={`Colaboradores de ${boardName}`}
    >
      <div className="space-y-6">
        {/* Barra de búsqueda */}
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar usuarios por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sección de agregar colaboradores - Solo visible para administradores */}
        {canManageCollaborators && (
          <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Plus size={20} className="mr-2 text-kodigo-primary" />
            Agregar Colaboradores
          </h3>

          {loadingUsers ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-kodigo-primary"></div>
              <span className="ml-2 text-gray-600">Cargando usuarios...</span>
            </div>
          ) : (
            <>
              {/* Lista de usuarios disponibles */}
              <div className="max-h-40 sm:max-h-60 overflow-y-auto space-y-2 mb-4">
                {availableUsers.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    {searchTerm ? 'No se encontraron usuarios con ese criterio' : 'No hay usuarios disponibles'}
                  </p>
                ) : (
                  availableUsers.map(user => (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedUsers.includes(user.id)
                          ? 'bg-kodigo-light/20 border-kodigo-primary'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => toggleUserSelection(user.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-kodigo-primary to-kodigo-secondary rounded-full flex items-center justify-center">
                          <User size={14} className="text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {selectedUsers.includes(user.id) ? (
                          <Check size={20} className="text-kodigo-primary" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Botón agregar */}
              {selectedUsers.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="text-sm text-gray-600 truncate">
                      {selectedUsers.length} usuario(s) seleccionado(s)
                    </span>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">Rol:</label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as 'viewer' | 'editor' | 'admin')}
                        className="w-24 sm:max-w-[140px] px-2 py-0.5 text-sm border border-gray-300 rounded"
                      >
                        <option value="viewer">👁️ Viewer</option>
                        <option value="editor">✏️ Editor</option>
                        <option value="admin">👑 Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      onClick={addSelectedCollaborators}
                      loading={addingUsers}
                      size="sm"
                      className="bg-kodigo-primary hover:bg-kodigo-dark"
                    >
                      <Plus size={16} className="mr-1" />
                      Agregar como {selectedRole === 'viewer' ? 'Viewer' : selectedRole === 'editor' ? 'Editor' : 'Admin'}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        )}

        {/* Sección de colaboradores existentes */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <User size={20} className="mr-2 text-kodigo-primary" />
            Colaboradores Actuales ({loadingUsers ? '...' : existingCollaborators.length})
          </h3>

          {loadingUsers ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="p-3 bg-white border rounded-lg animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full" />
                      <div className="min-w-0">
                        <div className="h-4 bg-gray-200 rounded w-40 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-28" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-6 w-20 bg-gray-200 rounded-full" />
                      <div className="h-6 w-6 bg-gray-200 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {existingCollaborators.map(user => {
                return (
                  <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white border rounded-lg overflow-hidden">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-8 h-8 bg-gradient-to-r from-kodigo-primary to-kodigo-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        <User size={14} className="text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{user.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {user.id === currentUserId && (
                            <span className="text-xs bg-kodigo-primary text-white px-2 py-1 rounded-full">
                              Tú
                            </span>
                          )}
                          {user.role === 'owner' && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                              Owner
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-1">{user.email}</p>
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-0 flex items-center space-x-3">
                      {/* Selector de rol */}
                      <select
                        value={user.role || 'editor'}
                        onChange={(e) => changeCollaboratorRole(user.id, e.target.value as 'viewer' | 'editor' | 'admin')}
                        disabled={!canManageCollaborators || user.id === currentUserId || user.role === 'owner'}
                        className={`w-28 sm:max-w-[140px] px-2 py-1 text-sm rounded-full border-0 flex items-center space-x-1 ${getRoleColor(user.role || 'editor')} disabled:opacity-50`}
                        style={{ minWidth: 0 }}
                      >
                        {user.role === 'owner' ? (
                          <option value="owner">👑 Owner</option>
                        ) : (
                          <>
                            <option value="viewer">👁️ Viewer</option>
                            <option value="editor">✏️ Editor</option>
                            <option value="admin">👑 Admin</option>
                          </>
                        )}
                      </select>

                      {/* Botón remover (solo si no es el usuario actual ni el owner y el usuario actual puede gestionar colaboradores) */}
                      {canManageCollaborators && user.id !== currentUserId && user.role !== 'owner' && (
                        <button
                          onClick={() => removeCollaborator(user.id)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="Remover colaborador"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};