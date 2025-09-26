import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, User, Save, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Modal } from '@/components/ui/Modal';
import { Card, UpdateCardRequest, Comment } from '@/models';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { commentService } from '@/services/commentService';

interface CardModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCard: (cardId: number, cardData: UpdateCardRequest) => Promise<void>;
}

export const CardModal: React.FC<CardModalProps> = ({
  card,
  isOpen,
  onClose,
  onUpdateCard
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(''); 
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!card) return;
    
    setCommentsLoading(true);
    try {
      const data = await commentService.getComments(card.id);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  }, [card]);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || '');
      setDueDate(card.due_date || '');
      fetchComments();
    }
  }, [card, fetchComments]);

  const handleSave = async () => {
    if (!card) return;
    
    setLoading(true);
    try {
      await onUpdateCard(card.id, {
        title,
        description,
        due_date: dueDate || undefined
      });
    } catch (error) {
      console.error('Error updating card:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!card || !newComment.trim()) return;
    
    try {
      await commentService.createComment(card.id, { content: newComment });
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (!card) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="space-y-6">
        {/* Card Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold border-0 px-0 focus:ring-0"
            />
          </div>
          <Button onClick={handleSave} loading={loading} size="sm">
            <Save size={16} className="mr-1" />
            Guardar
          </Button>
        </div>

        {/* Card Details */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                rows={4}
                placeholder="Añade una descripción más detallada..."
              />
            </div>

            {/* Comments */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <MessageCircle size={16} className="mr-2" />
                Comentarios
              </h4>
              
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {commentsLoading ? (
                  <p className="text-sm text-gray-500">Cargando comentarios...</p>
                ) : comments.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay comentarios aún.</p>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <User size={12} className="text-white" />
                        </div>
                        <span className="text-sm font-medium">
                          {comment.user?.name || 'Usuario'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(comment.created_at), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe un comentario..."
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <Button onClick={handleAddComment} size="sm">
                  Comentar
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Due Date */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="mr-2" />
                Fecha de vencimiento
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Labels */}
            {card.labels && card.labels.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etiquetas
                </label>
                <div className="flex flex-wrap gap-2">
                  {card.labels.map(label => (
                    <span
                      key={label.id}
                      className="px-2 py-1 text-xs font-medium rounded"
                      style={{
                        backgroundColor: label.color + '20',
                        color: label.color
                      }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Created by */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Creado por
              </label>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User size={14} className="text-white" />
                </div>
                <span className="text-sm">{card.user?.name || 'Usuario'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};