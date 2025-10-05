import React from 'react';
import { useSyncContext } from '@/contexts/SyncContext';

export const SyncIndicator: React.FC = () => {
  const { isSyncing } = useSyncContext();

  if (!isSyncing) return null;

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center sm:justify-end px-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg border border-gray-200/50 flex items-center space-x-2">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-kodigo-primary" />
        <span className="text-xs sm:text-sm text-gray-600">Sincronizando...</span>
      </div>
    </div>
  );
};