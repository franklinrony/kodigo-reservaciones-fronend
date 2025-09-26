import React, { useState, useRef, useEffect } from 'react';

interface InlineEditProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  editClassName?: string;
  disabled?: boolean;
}

export const InlineEdit: React.FC<InlineEditProps> = ({
  value,
  onSave,
  multiline = false,
  placeholder = "Haz clic para editar...",
  className = "",
  editClassName = "",
  disabled = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditedValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (!multiline) {
        (inputRef.current as HTMLInputElement).select();
      }
    }
  }, [isEditing, multiline]);

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

  const handleCancel = () => {
    setIsEditing(false);
    setEditedValue(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (!multiline || e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (disabled) {
    return <div className={className}>{value}</div>;
  }

  if (isEditing) {
    const InputComponent = multiline ? 'textarea' : 'input';
    
    return (
      <InputComponent
        ref={inputRef as React.RefObject<HTMLInputElement & HTMLTextAreaElement>}
        type={!multiline ? "text" : undefined}
        value={editedValue}
        onChange={(e) => setEditedValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        disabled={isSaving}
        placeholder={placeholder}
        className={`bg-white border-2 border-blue-500 rounded px-2 py-1 outline-none resize-none ${editClassName} ${
          isSaving ? 'opacity-50' : ''
        }`}
        rows={multiline ? 3 : undefined}
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
      {value || placeholder}
    </div>
  );
};