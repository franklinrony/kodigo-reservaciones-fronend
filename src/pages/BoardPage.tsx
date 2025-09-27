import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBoard } from '@/hooks/useBoard';
import { BoardHeader } from '@/components/boards/BoardHeader';
import { KanbanView } from '@/components/views/KanbanView';
import { TableView } from '@/components/views/TableView';
import { CardModal } from '@/components/cards/CardModal';
import { Card, UpdateCardRequest } from '@/models';
import { cardService } from '@/services/cardService';

export const BoardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const boardId = parseInt(id || '0', 10);
  const { board, loading, error, refetch } = useBoard(boardId);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    setIsCardModalOpen(true);
  };

  const handleUpdateCard = async (cardId: number, cardData: UpdateCardRequest) => {
    await cardService.updateCard(cardId, cardData);
    refetch();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kodigo-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tablero...</p>
        </div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar el tablero</p>
          <p className="text-gray-600">{error || 'Tablero no encontrado'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <BoardHeader
        board={board}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      <div className="flex-1 overflow-hidden">
        {viewMode === 'kanban' ? (
          <KanbanView
            board={board}
            onCardClick={handleCardClick}
            onBoardUpdate={refetch}
          />
        ) : (
          <TableView
            board={board}
            onCardClick={handleCardClick}
            onBoardUpdate={refetch}
          />
        )}
      </div>

      <CardModal
        card={selectedCard}
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false);
          setSelectedCard(null);
        }}
        onUpdateCard={handleUpdateCard}
      />
    </div>
  );
};