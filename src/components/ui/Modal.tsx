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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Flexbox container for perfect centering */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className={clsx(
            'bg-white rounded-lg shadow-xl w-full relative z-10',
            {
              'max-w-sm': size === 'sm',
              'max-w-md': size === 'md', 
              'max-w-2xl': size === 'lg',
              'max-w-5xl': size === 'xl', // Cambio a max-w-5xl para hacerlo aún más ancho
            }
          )}
        >
          {title && (
            <div className="flex items-center justify-between p-4 sm:p-6 border-b">
              <h3 className="text-lg sm:text-xl font-medium text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
          )}
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};