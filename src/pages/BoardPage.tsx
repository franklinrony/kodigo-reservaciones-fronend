import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBoard } from '@/hooks/useBoard';
import { BoardHeader } from '@/components/boards/BoardHeader';
import { useBoardPermissionsContext } from '@/hooks/useBoardPermissions';
import { useAuth } from '@/hooks/useAuth';
import { labelService } from '@/services/labelService';
import { userService } from '@/services/userService';
import { KanbanView } from '@/components/views/KanbanView';
import { TableView } from '@/components/views/TableView';
import { CardModal } from '@/components/cards/CardModal';
import { Card, UpdateCardRequest } from '@/models';
import { cardService } from '@/services/cardService';
import MobileDisclaimer from '@/components/ui/MobileDisclaimer';

export const BoardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const boardId = parseInt(id || '0', 10);
  const { board, loading, error, refetch } = useBoard(boardId);
  const { loading: authLoading } = useAuth();
  const { refreshBoardPermissions } = useBoardPermissionsContext();
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [loadingRelatedData, setLoadingRelatedData] = useState(false);

  // Load related endpoints required by collaborators view: auth/me (via useAuth), labels and specific user
  React.useEffect(() => {
    let cancelled = false;

    const loadRelated = async () => {
      if (!board) return;
      setLoadingRelatedData(true);
      try {
        // call labels and board owner user in parallel
        const ownerId = board.user_id;
        await Promise.all([
          labelService.getAllLabels(),
          // If ownerId is present, fetch that user; otherwise skip
          ownerId ? userService.getUserById(ownerId) : Promise.resolve(null)
        ]);
      } catch (err) {
        // swallow errors here; header will stop loading but other error handling remains elsewhere
        console.error('Error loading related data:', err);
      } finally {
        if (!cancelled) setLoadingRelatedData(false);
      }
    };

    // trigger when board becomes available
    if (board) {
      loadRelated();
    }

    return () => {
      cancelled = true;
    };
  }, [board]);

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    setIsCardModalOpen(true);
  };

  const handleUpdateCard = async (cardId: number, cardData: UpdateCardRequest) => {
    try {
      await cardService.updateCard(cardId, cardData);
      // Wait for refetch to complete so callers (e.g. CardModal) see updated board data
      const refreshed = await refetch();
      // If the modal has that card open, update selectedCard with the fresh data
      if (refreshed && selectedCard && selectedCard.id === cardId) {
  const freshCard = refreshed.lists?.flatMap(l => l.cards || []).find((c: unknown) => (c as Card).id === cardId) as Card | undefined;
        if (freshCard) setSelectedCard(freshCard);
      }
    } catch (error) {
      console.error('Error in handleUpdateCard:', error);
      // Re-throw so callers can handle the error
      throw error;
    }
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
        onCollaboratorsUpdate={async () => {
          // Refetch board data and refresh permissions so UI updates immediately
          await refetch();
          await refreshBoardPermissions(boardId);
        }}
        boardOwnerId={board.user_id}
        loadingRelatedData={authLoading || loadingRelatedData}
      />
      
      <div className="flex-1 overflow-hidden">
        <MobileDisclaimer />
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
        boardLists={board.lists?.map(list => ({ id: list.id, name: list.name })) || []}
        boardId={board.id}
      />
    </div>
  );
};