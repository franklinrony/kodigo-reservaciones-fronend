import { useState, useEffect } from 'react';
import { Board } from '@/models';
import { boardService } from '@/services/boardService';
import { useSyncContext } from '@/contexts/SyncContext';

export const useBoard = (boardId: number) => {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { startSync, endSync } = useSyncContext();

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        setLoading(true);
        const data = await boardService.getBoardById(boardId.toString());
        setBoard(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch board');
      } finally {
        setLoading(false);
      }
    };

    if (boardId) {
      fetchBoard();
    }
  }, [boardId]);

  const refetchBoard = async () => {
    try {
      // Solo mostrar loading completo si no hay board cargado
      if (!board) {
        setLoading(true);
      } else {
        startSync('board-refetch');
      }
      const data = await boardService.getBoardById(boardId.toString());
      setBoard(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch board');
      throw err;
    } finally {
      setLoading(false);
      endSync('board-refetch');
    }
  };

  return {
    board,
    loading,
    error,
    refetch: refetchBoard,
    setBoard
  };
};