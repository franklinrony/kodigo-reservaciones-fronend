import React, { useState, useRef, useEffect } from 'react';
import { truncateText } from '@/utils/textUtils';

interface TruncatedInlineEditProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  maxLength?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const TruncatedInlineEdit: React.FC<TruncatedInlineEditProps> = ({
  value,
  onSave,
  maxLength = 75,
  placeholder = "Haz clic para agregar...",
  className = "",
  disabled = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditedValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (editedValue.trim() === value.trim()) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editedValue.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving:', error);
      setEditedValue(value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    
    // Si no hay relatedTarget (clic en área vacía), siempre guardar
    if (!relatedTarget) {
      setTimeout(() => {
        if (isEditing) {
          handleSave();
        }
      }, 50);
      return;
    }
    
    // Si el foco va a elementos específicos que no deberían cerrar el editor (dropdowns, menús)
    if (relatedTarget.closest('.dropdown') || 
        relatedTarget.closest('[role="menuitem"]')) {
      return;
    }
    
    // Si el foco va a un botón que NO está dentro de la misma tarjeta, guardar
    // Si el foco va a cualquier parte de la tarjeta (incluyendo botones de la tarjeta), también guardar
    const currentCard = e.currentTarget.closest('.kanban-card');
    const targetCard = relatedTarget.closest('.kanban-card');
    
    // Si estamos cambiando a un elemento fuera de la tarjeta actual, o dentro de la misma tarjeta, guardar
    if (!targetCard || targetCard !== currentCard || relatedTarget.tagName === 'BUTTON') {
      setTimeout(() => {
        if (isEditing) {
          handleSave();
        }
      }, 50);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedValue(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const { truncated, hasMore } = truncateText(value, maxLength);

  if (disabled) {
    return (
      <div className={className}>
        {value ? (
          <>
            {truncated}
            {hasMore && <span className="text-kodigo-primary ml-1 font-medium">... más</span>}
          </>
        ) : (
          <span className="text-gray-400 italic">{placeholder}</span>
        )}
      </div>
    );
  }

  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        value={editedValue}
        onChange={(e) => setEditedValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={isSaving}
        placeholder={placeholder}
        className={`w-full bg-white border-2 border-blue-500 rounded px-2 py-1 outline-none resize-none ${
          isSaving ? 'opacity-50' : ''
        } ${className}`}
        rows={3}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer hover:bg-gray-50 rounded px-2 py-1 -mx-2 -my-1 transition-colors ${className} ${
        !value ? 'text-gray-400 italic' : ''
      }`}
      title="Haz clic para editar"
    >
      {value ? (
        <>
          {truncated}
          {hasMore && <span className="text-kodigo-primary ml-1 font-medium">... más</span>}
        </>
      ) : (
        placeholder
      )}
    </div>
  );
};