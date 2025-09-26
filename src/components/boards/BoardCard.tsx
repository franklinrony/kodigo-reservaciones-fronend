import React from 'react';
import { Link } from 'react-router-dom';
import { Board } from '@/models';
import { Calendar, Users, Lock, Globe } from 'lucide-react';
import { format } from 'date-fns';

interface BoardCardProps {
  board: Board;
}

export const BoardCard: React.FC<BoardCardProps> = ({ board }) => {
  return (
    <Link
      to={`/board/${board.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{board.name}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{board.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          {board.is_public ? (
            <Globe className="w-4 h-4 text-green-500" />
          ) : (
            <Lock className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(board.created_at), 'dd/MM/yyyy')}</span>
          </div>
          {board.collaborators && board.collaborators.length > 0 && (
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{board.collaborators.length} colaboradores</span>
            </div>
          )}
        </div>
        
        {board.lists && (
          <span className="text-blue-600 font-medium">
            {board.lists.length} listas
          </span>
        )}
      </div>
    </Link>
  );
};