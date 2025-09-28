import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Board } from '@/models';
import { Button } from '@/components/ui/Button';
import { CollaboratorsModal } from './CollaboratorsModal';
import { Settings, Users, Eye, Table, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface BoardHeaderProps {
  board: Board;
  viewMode: 'kanban' | 'table';
  onViewModeChange: (mode: 'kanban' | 'table') => void;
  onCollaboratorsUpdate?: () => void;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({
  board,
  viewMode,
  onViewModeChange,
  onCollaboratorsUpdate
}) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [isCollaboratorsModalOpen, setIsCollaboratorsModalOpen] = useState(false);

  const handleBackToBoards = () => {
    navigate('/boards');
  };
  return (
    <div className="bg-white border-b-2 border-kodigo-primary/20 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
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
          
          <div>
            <h1 className="text-2xl font-bold text-kodigo-gradient">{board.name}</h1>
            {board.description && (
              <p className="text-gray-600 mt-1">{board.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex bg-kodigo-light/30 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('kanban')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-kodigo-primary text-white shadow-md'
                  : 'text-kodigo-primary hover:text-kodigo-dark hover:bg-kodigo-light/50'
              }`}
            >
              <Eye size={16} className="inline mr-1" />
              Kanban
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-kodigo-primary text-white shadow-md'
                  : 'text-kodigo-primary hover:text-kodigo-dark hover:bg-kodigo-light/50'
              }`}
            >
              <Table size={16} className="inline mr-1" />
              Tabla
            </button>
          </div>
          
          {/* Board Actions */}
          <Button
            variant="ghost"
            size="sm"
            className="text-kodigo-secondary hover:text-kodigo-secondary/80 hover:bg-kodigo-secondary/10"
            onClick={() => setIsCollaboratorsModalOpen(true)}
          >
            <Users size={16} className="mr-1" />
            Colaboradores
          </Button>
          
          <Button variant="ghost" size="sm" className="text-kodigo-accent hover:text-kodigo-accent/80 hover:bg-kodigo-accent/10">
            <Settings size={16} className="mr-1" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Modal de Colaboradores */}
      <CollaboratorsModal
        isOpen={isCollaboratorsModalOpen}
        onClose={() => setIsCollaboratorsModalOpen(false)}
        boardId={board.id}
        boardName={board.name}
        currentUserId={currentUser?.id || 0}
        onCollaboratorsUpdate={onCollaboratorsUpdate || (() => {})}
      />
    </div>
  );
};