import { useState, useEffect, useCallback, useRef } from 'react';
import { Board } from '@/models';
import { boardService } from '@/services/boardService';
import { useBoardPermissionsContext } from '@/contexts/BoardPermissionsContext';

export const useBoards = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { preloadBoardPermissions } = useBoardPermissionsContext();
  
  // Usar ref para mantener una referencia estable a la función
  const preloadBoardPermissionsRef = useRef(preloadBoardPermissions);
  preloadBoardPermissionsRef.current = preloadBoardPermissions;

  const fetchBoards = useCallback(async () => {
    try {
      console.log('useBoards - Iniciando fetch de tableros...');
      setLoading(true);
      const data = await boardService.getBoards();
      console.log('useBoards - Tableros obtenidos:', data);
      console.log('useBoards - Tipo de data:', typeof data);
      console.log('useBoards - Es array?:', Array.isArray(data));
      setBoards(data);
      setError(null);

      // Precargar permisos de todos los tableros
      if (data && data.length > 0) {
        const boardIds = data.map(board => board.id);
        console.log('useBoards - Precargando permisos para boards:', boardIds);
        await preloadBoardPermissionsRef.current(boardIds);
        console.log('useBoards - Permisos precargados');
      }
    } catch (err) {
      console.error('useBoards - Error al obtener tableros:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch boards');
    } finally {
      setLoading(false);
    }
  }, []); // Sin dependencias para evitar re-ejecuciones

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const createBoard = async (boardData: { name: string; description?: string; is_public?: boolean }) => {
    try {
      const newBoard = await boardService.createBoard(boardData);
      setBoards(prev => [...prev, newBoard]);
      return newBoard;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create board');
      throw err;
    }
  };

  const updateBoard = async (id: number, boardData: Partial<{ name: string; description?: string; is_public?: boolean }>) => {
    try {
      const updatedBoard = await boardService.updateBoard(id.toString(), boardData);
      setBoards(prev => prev.map(board => board.id === id ? updatedBoard : board));
      return updatedBoard;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update board');
      throw err;
    }
  };

  const deleteBoard = async (id: number) => {
    try {
      await boardService.deleteBoard(id.toString());
      setBoards(prev => prev.filter(board => board.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete board');
      throw err;
    }
  };

  return {
    boards,
    loading,
    error,
    refetch: fetchBoards,
    createBoard,
    updateBoard,
    deleteBoard
  };
};