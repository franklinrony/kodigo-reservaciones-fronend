import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Board } from '@/models';
import { Button } from '@/components/ui/Button';
import { CollaboratorsModal } from './CollaboratorsModal';
import { Users, Eye, Table, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBoardPermissions } from '@/hooks/useBoardPermissions';

interface BoardHeaderProps {
  board: Board;
  viewMode: 'kanban' | 'table';
  onViewModeChange: (mode: 'kanban' | 'table') => void;
  onCollaboratorsUpdate?: () => void;
  boardOwnerId?: number;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({
  board,
  viewMode,
  onViewModeChange,
  onCollaboratorsUpdate,
  boardOwnerId
}) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { canManageCollaborators } = useBoardPermissions(board.id);
  const [isCollaboratorsModalOpen, setIsCollaboratorsModalOpen] = useState(false);

  const handleBackToBoards = () => {
    navigate('/boards');
  };
  return (
    <div className="bg-white border-b-2 border-kodigo-primary/20 px-4 sm:px-6 py-3 shadow-sm">
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap">
  <div className="flex items-start sm:items-center space-x-3 w-full sm:w-auto flex-shrink">
          {/* Botón Volver */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackToBoards}
            className="text-kodigo-primary hover:text-kodigo-dark hover:bg-kodigo-light/50"
          >
            <ArrowLeft size={16} className="mr-1" />
            Volver a tableros
          </Button>
          
          <div className="border-l border-kodigo-primary/30 h-6"></div>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-kodigo-gradient truncate">{board.name}</h1>
            {board.description && (
              <p className="text-gray-600 mt-1 hidden sm:block truncate">{board.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto flex-shrink-0">
          {/* View Mode Toggle */}
          <div className="flex bg-kodigo-light/30 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('kanban')}
              className={`px-2 py-2 text-sm font-medium rounded-md transition-colors flex items-center ${
                viewMode === 'kanban'
                  ? 'bg-kodigo-primary text-white shadow-md'
                  : 'text-kodigo-primary hover:text-kodigo-dark hover:bg-kodigo-light/50'
              }`}
            >
              <Eye size={16} className="inline" />
              <span className="hidden sm:inline ml-2">Kanban</span>
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`px-2 py-2 text-sm font-medium rounded-md transition-colors flex items-center ${
                viewMode === 'table'
                  ? 'bg-kodigo-primary text-white shadow-md'
                  : 'text-kodigo-primary hover:text-kodigo-dark hover:bg-kodigo-light/50'
              }`}
            >
              <Table size={16} className="inline" />
              <span className="hidden sm:inline ml-2">Tabla</span>
            </button>
          </div>
          
          {/* Board Actions */}
          {canManageCollaborators && (
            <Button
              variant="ghost"
              size="sm"
              className="text-kodigo-secondary hover:text-kodigo-secondary/80 hover:bg-kodigo-secondary/10 flex items-center"
              onClick={() => setIsCollaboratorsModalOpen(true)}
            >
              <Users size={16} className="mr-1" />
              <span className="hidden sm:inline">Colaboradores</span>
            </Button>
          )}
        </div>
      </div>

      {/* Modal de Colaboradores */}
      <CollaboratorsModal
        isOpen={isCollaboratorsModalOpen}
        onClose={() => setIsCollaboratorsModalOpen(false)}
        boardId={board.id}
        boardName={board.name}
        boardOwnerId={boardOwnerId || board.user_id}
        currentUserId={currentUser?.id || 0}
        onCollaboratorsUpdate={onCollaboratorsUpdate || (() => {})}
      />
    </div>
  );
};