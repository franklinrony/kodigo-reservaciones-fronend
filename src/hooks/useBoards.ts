import { useState, useEffect } from 'react';
import { Board } from '@/models';
import { boardService } from '@/services/boardService';

export const useBoards = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoards = async () => {
    try {
      console.log('useBoards - Iniciando fetch de tableros...');
      setLoading(true);
      const data = await boardService.getBoards();
      console.log('useBoards - Tableros obtenidos:', data);
      console.log('useBoards - Tipo de data:', typeof data);
      console.log('useBoards - Es array?:', Array.isArray(data));
      setBoards(data);
      setError(null);
    } catch (err) {
      console.error('useBoards - Error al obtener tableros:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch boards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

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