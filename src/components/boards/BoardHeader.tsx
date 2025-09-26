import React from 'react';
import { Board } from '@/models';
import { Button } from '@/components/ui/Button';
import { Settings, Users, Eye, Table } from 'lucide-react';

interface BoardHeaderProps {
  board: Board;
  viewMode: 'kanban' | 'table';
  onViewModeChange: (mode: 'kanban' | 'table') => void;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({
  board,
  viewMode,
  onViewModeChange
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{board.name}</h1>
          {board.description && (
            <p className="text-gray-600 mt-1">{board.description}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('kanban')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye size={16} className="inline mr-1" />
              Kanban
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Table size={16} className="inline mr-1" />
              Tabla
            </button>
          </div>
          
          {/* Board Actions */}
          <Button variant="ghost" size="sm">
            <Users size={16} className="mr-1" />
            Colaboradores
          </Button>
          
          <Button variant="ghost" size="sm">
            <Settings size={16} className="mr-1" />
            Configurar
          </Button>
        </div>
      </div>
    </div>
  );
};