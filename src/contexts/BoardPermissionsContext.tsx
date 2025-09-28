import React, { createContext, useContext, useEffect, ReactNode, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { boardService } from '@/services/boardService';
import { userService } from '@/services/userService';
import { User } from '@/models';

export type UserBoardRole = 'owner' | 'admin' | 'editor' | 'viewer' | null;

interface BoardPermissions {
  userRole: UserBoardRole;
  canEdit: boolean;
  canDelete: boolean;
  canManageCollaborators: boolean;
  canView: boolean;
  loading: boolean;
  boardUsers?: User[];
}

interface BoardPermissionsContextType {
  getBoardPermissions: (boardId: number) => BoardPermissions;
  getBoardUsers: (boardId: number) => User[] | undefined;
  preloadBoardPermissions: (boardIds: number[]) => Promise<void>;
}

const BoardPermissionsContext = createContext<BoardPermissionsContextType | undefined>(undefined);

export const useBoardPermissionsContext = () => {
  const context = useContext(BoardPermissionsContext);
  if (!context) {
    throw new Error('useBoardPermissionsContext must be used within a BoardPermissionsProvider');
  }
  return context;
};

// Cache global para permisos de tableros
const boardPermissionsCache = new Map<number, BoardPermissions>();

interface BoardPermissionsProviderProps {
  children: ReactNode;
}

export const BoardPermissionsProvider: React.FC<BoardPermissionsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [, forceUpdate] = useState({}); // Para forzar re-renders

  const getBoardPermissions = useCallback((boardId: number): BoardPermissions => {
    // Retornar del cache si existe
    if (boardPermissionsCache.has(boardId)) {
      return boardPermissionsCache.get(boardId)!;
    }

    // Crear entrada en cache con estado de carga
    const loadingPermissions: BoardPermissions = {
      userRole: null,
      canEdit: false,
      canDelete: false,
      canManageCollaborators: false,
      canView: false,
      loading: true,
      boardUsers: []
    };

    boardPermissionsCache.set(boardId, loadingPermissions);

    // Cargar permisos de forma asíncrona
    loadBoardPermissions(boardId, user?.id);

    return loadingPermissions;
  }, [user?.id]);

  const getBoardUsers = useCallback((boardId: number): User[] | undefined => {
    const permissions = getBoardPermissions(boardId);
    return permissions.boardUsers;
  }, [getBoardPermissions]);

  const loadBoardPermissions = async (boardId: number, userId?: number) => {
    if (!userId) {
      const noAccessPermissions: BoardPermissions = {
        userRole: null,
        canEdit: false,
        canDelete: false,
        canManageCollaborators: false,
        canView: false,
        loading: false,
        boardUsers: []
      };
      boardPermissionsCache.set(boardId, noAccessPermissions);
      forceUpdate({}); // Forzar re-render
      return;
    }

    try {
      // Cargar el board primero para determinar permisos básicos
      const board = await boardService.getBoardById(boardId.toString());

      console.log('BoardPermissionsProvider - User ID:', userId);
      console.log('BoardPermissionsProvider - Board owner ID:', board.user_id);

      // Determinar rol básico basado en el board
      let userRole: UserBoardRole = null;
      if (board.user_id === userId) {
        userRole = 'owner';
      }

      // Intentar usar los collaborators del board, o cargar usuarios si no están disponibles
      let boardUsers: User[] = [];
      try {
        // Si el board ya incluye collaborators, úsalos
        if (board.collaborators && board.collaborators.length > 0) {
          // Los collaborators ya incluyen la info del usuario
          boardUsers = board.collaborators.map(collaborator => ({
            id: collaborator.id,
            name: collaborator.name,
            email: collaborator.email,
            created_at: collaborator.created_at,
            updated_at: collaborator.updated_at,
            role: (collaborator.pivot?.role as 'owner' | 'admin' | 'editor' | 'viewer') || undefined
          }));
          console.log('BoardPermissionsProvider - Using collaborators from board:', boardUsers);
        } else {
          // Fallback: cargar usuarios con llamada adicional
          boardUsers = await userService.getBoardUsers(boardId);
          console.log('BoardPermissionsProvider - Board users loaded separately:', boardUsers);
        }

        // Si no somos owner, determinar rol basado en la lista de usuarios
        if (userRole !== 'owner') {
          const boardUser = boardUsers.find(user => user.id === userId);
          console.log('BoardPermissionsProvider - Finding user role:', {
            userId,
            boardUsers: boardUsers.map(u => ({ id: u.id, role: u.role })),
            foundUser: boardUser
          });
          if (boardUser) {
            userRole = boardUser.role as UserBoardRole || 'editor';
            console.log('BoardPermissionsProvider - Assigned role:', userRole);
          } else {
            userRole = null;
            console.log('BoardPermissionsProvider - User not found in collaborators, role: null');
          }
        }
      } catch (usersError) {
        console.warn('BoardPermissionsProvider - Could not load board users, using basic permissions:', usersError);
        // Si no podemos cargar usuarios pero somos owner, mantener permisos de owner
        // Si no somos owner, asumir viewer si tenemos acceso al board
        if (userRole !== 'owner') {
          // Verificar si el usuario tiene algún acceso al board (esto podría necesitar otro endpoint)
          userRole = 'viewer'; // Asumir viewer por defecto si no podemos verificar
        }
      }

      // Calcular permisos basados en el rol
      const permissions: BoardPermissions = {
        userRole,
        canEdit: userRole === 'owner' || userRole === 'admin' || userRole === 'editor',
        canDelete: userRole === 'owner' || userRole === 'admin',
        canManageCollaborators: userRole === 'owner' || userRole === 'admin',
        canView: userRole !== null,
        loading: false,
        boardUsers
      };

      // Actualizar cache
      boardPermissionsCache.set(boardId, permissions);
      forceUpdate({}); // Forzar re-render

    } catch (error) {
      console.error('Error loading board permissions:', error);
      const errorPermissions: BoardPermissions = {
        userRole: null,
        canEdit: false,
        canDelete: false,
        canManageCollaborators: false,
        canView: false,
        loading: false,
        boardUsers: []
      };
      boardPermissionsCache.set(boardId, errorPermissions);
      forceUpdate({}); // Forzar re-render
    }
  };

  const preloadBoardPermissions = useCallback(async (boardIds: number[]) => {
    const promises = boardIds.map(boardId => loadBoardPermissions(boardId, user?.id));
    await Promise.all(promises);
  }, [user?.id]);

  // Limpiar cache cuando cambia el usuario
  useEffect(() => {
    boardPermissionsCache.clear();
  }, [user?.id]);

  const contextValue: BoardPermissionsContextType = {
    getBoardPermissions,
    getBoardUsers,
    preloadBoardPermissions
  };

  return (
    <BoardPermissionsContext.Provider value={contextValue}>
      {children}
    </BoardPermissionsContext.Provider>
  );
};