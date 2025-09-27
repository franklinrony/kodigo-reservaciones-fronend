import React from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = () => {
    // Siempre llamar a onClose, que puede ser handleCloseAttempt del CardModal
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleOverlayClick}
      />
      
      {/* Container responsive con scroll */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div
          className={clsx(
            'relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 w-full',
            {
              'sm:max-w-sm': size === 'sm',
              'sm:max-w-lg': size === 'md', 
              'sm:max-w-4xl': size === 'lg',
              'sm:max-w-6xl max-h-[90vh] overflow-y-auto': size === 'xl',
            }
          )}
        >
          {title && (
            <div className="flex items-center justify-between px-4 py-4 sm:px-6 border-b bg-white sticky top-0 z-10">
              <h3 className="text-lg sm:text-xl font-medium text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded flex-shrink-0"
              >
                <X size={20} />
              </button>
            </div>
          )}
          <div className="px-4 py-4 sm:px-6 sm:py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};