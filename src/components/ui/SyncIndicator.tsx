import React from 'react';
import { useSyncContext } from '@/contexts/SyncContext';

export const SyncIndicator: React.FC = () => {
  const { isSyncing } = useSyncContext();

  if (!isSyncing) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg border border-gray-200/50 flex items-center space-x-2">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-kodigo-primary"></div>
        <span className="text-xs text-gray-600">Sincronizando...</span>
      </div>
    </div>
  );
};