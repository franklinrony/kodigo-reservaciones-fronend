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
      className="block card-kodigo p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 border-l-4 border-kodigo-primary"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{board.name}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{board.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          {board.is_public ? (
            <div className="p-1 bg-green-100 rounded-full">
              <Globe className="w-4 h-4 text-green-600" />
            </div>
          ) : (
            <div className="p-1 bg-gray-100 rounded-full">
              <Lock className="w-4 h-4 text-gray-500" />
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4 text-kodigo-primary" />
            <span>{format(new Date(board.created_at), 'dd/MM/yyyy')}</span>
          </div>
          {board.collaborators && board.collaborators.length > 0 && (
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-kodigo-secondary" />
              <span>{board.collaborators.length} colaboradores</span>
            </div>
          )}
        </div>
        
        {board.lists && (
          <span className="text-kodigo-primary font-medium bg-kodigo-primary/10 px-2 py-1 rounded-full">
            {board.lists.length} listas
          </span>
        )}
      </div>
    </Link>
  );
};