import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CreateBoardRequest } from '@/models';

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBoard: (boardData: CreateBoardRequest) => Promise<void>;
}

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({
  isOpen,
  onClose,
  onCreateBoard
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onCreateBoard({
        name,
        description: description || undefined,
        is_public: isPublic
      });
      setName('');
      setDescription('');
      setIsPublic(false);
      onClose();
    } catch {
      // Error handling is done in the parent component
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Nuevo Tablero" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre del Tablero"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Ej: Proyecto Frontend"
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción (Opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            rows={3}
            placeholder="Describe el propósito de este tablero..."
          />
        </div>
        
        <div className="flex items-center">
          <input
            id="is-public"
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is-public" className="ml-2 block text-sm text-gray-900">
            Hacer este tablero público
          </label>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            Crear Tablero
          </Button>
        </div>
      </form>
    </Modal>
  );
};