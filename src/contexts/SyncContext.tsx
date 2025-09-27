import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SyncContextType {
  isSyncing: boolean;
  syncOperations: Set<string>;
  startSync: (operationId: string) => void;
  endSync: (operationId: string) => void;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const useSyncContext = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSyncContext must be used within a SyncProvider');
  }
  return context;
};

interface SyncProviderProps {
  children: ReactNode;
}

export const SyncProvider: React.FC<SyncProviderProps> = ({ children }) => {
  const [syncOperations, setSyncOperations] = useState<Set<string>>(new Set());

  const startSync = (operationId: string) => {
    setSyncOperations(prev => new Set([...prev, operationId]));
  };

  const endSync = (operationId: string) => {
    setSyncOperations(prev => {
      const newSet = new Set(prev);
      newSet.delete(operationId);
      return newSet;
    });
  };

  const isSyncing = syncOperations.size > 0;

  return (
    <SyncContext.Provider value={{ isSyncing, syncOperations, startSync, endSync }}>
      {children}
    </SyncContext.Provider>
  );
};