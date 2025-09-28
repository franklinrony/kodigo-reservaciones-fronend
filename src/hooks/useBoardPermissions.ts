import { useState, useEffect } from 'react';
import { useBoardPermissionsContext } from '@/contexts/BoardPermissionsContext';

// Hook personalizado que usa el contexto de permisos
export const useBoardPermissions = (boardId: number) => {
  const { getBoardPermissions } = useBoardPermissionsContext();
  const permissions = getBoardPermissions(boardId);

  // Forzar re-render cuando cambien los permisos
  const [, forceUpdate] = useState({});
  useEffect(() => {
    const handlePermissionsUpdate = (event: CustomEvent) => {
      if (event.detail.boardId === boardId) {
        forceUpdate({});
      }
    };

    window.addEventListener('boardPermissionsUpdated', handlePermissionsUpdate as EventListener);
    return () => window.removeEventListener('boardPermissionsUpdated', handlePermissionsUpdate as EventListener);
  }, [boardId]);

  return {
    ...permissions,
    boardUsers: permissions.boardUsers || []
  };
};