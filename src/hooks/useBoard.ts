import { useState, useEffect } from 'react';
import { Board } from '@/models';
import { boardService } from '@/services/boardService';

export const useBoard = (boardId: number) => {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return {
    board,
    loading,
    error,
    refetch: refetchBoard,
    setBoard
  };
};