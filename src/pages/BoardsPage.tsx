import React, { useState } from 'react';
import { useBoards } from '../hooks/useBoards';
import { BoardCard } from '../components/boards/BoardCard';
import { CreateBoardModal } from '../components/boards/CreateBoardModal';
import { Button } from '../components/ui/Button';
import { CreateBoardRequest } from '@/models';
import { Plus, Search } from 'lucide-react';

export const BoardsPage: React.FC = () => {
  const { boards, loading, error, createBoard } = useBoards();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  console.log('BoardsPage - Estado actual:', { boards, loading, error });

  // Wrapper para el callback de crear tablero
  const handleCreateBoard = async (boardData: CreateBoardRequest): Promise<void> => {
    await createBoard(boardData);
    setIsCreateModalOpen(false);
  };

  // Verificación defensiva para evitar el crash
  const safeBoardsList = boards || [];
  console.log('BoardsPage - safeBoardsList:', safeBoardsList);
  console.log('BoardsPage - safeBoardsList.length:', safeBoardsList.length);
  
  const filteredBoards = safeBoardsList.filter(board =>
    board.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (board.description && board.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  console.log('BoardsPage - filteredBoards:', filteredBoards);
  console.log('BoardsPage - filteredBoards.length:', filteredBoards.length);
  console.log('BoardsPage - searchTerm:', searchTerm);
  console.log('BoardsPage - Condición para mostrar "no hay tableros":', filteredBoards.length === 0);

  if (loading) {
    console.log('BoardsPage - Mostrando loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kodigo-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tableros...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('BoardsPage - Mostrando error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar los tableros</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  console.log('BoardsPage - Renderizando página principal...');
  console.log('BoardsPage - ¿Mostrar mensaje vacío?', filteredBoards.length === 0);
  console.log('BoardsPage - ¿Mostrar grilla de tableros?', filteredBoards.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-kodigo-gradient">Mis Tableros</h1>
            <p className="text-gray-600 mt-1">
              Gestiona todos tus proyectos desde un solo lugar
            </p>
          </div>
          
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 sm:mt-0"
            variant="gradient"
          >
            <Plus size={20} className="mr-2" />
            Crear Tablero
          </Button>
        </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar tableros..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-kodigo-primary focus:border-kodigo-primary"
        />
      </div>

      {/* Boards Grid */}
      {filteredBoards.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-kodigo-light/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus size={32} className="text-kodigo-primary" />
          </div>
          <h3 className="text-lg font-medium text-kodigo-gradient mb-2">
            {searchTerm ? 'No se encontraron tableros' : 'No tienes tableros aún'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda'
              : 'Crea tu primer tablero para comenzar a organizar tus tareas'
            }
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsCreateModalOpen(true)} variant="gradient">
              <Plus size={20} className="mr-2" />
              Crear mi primer tablero
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBoards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>
      )}

      {/* Create Board Modal */}
      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateBoard={handleCreateBoard}
      />
      </div>
    </div>
  );
};