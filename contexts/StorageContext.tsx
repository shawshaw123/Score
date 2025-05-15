import React, { createContext, useState, useContext, useEffect } from 'react';

interface StorageContextType {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

// This is a mock storage implementation
// In a real app, this would use AsyncStorage
const StorageContext = createContext<StorageContextType>({
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
});

export const useStorage = () => useContext(StorageContext);

export const StorageProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // In-memory storage for web demo
  const [storage, setStorage] = useState<Record<string, string>>({});
  
  const getItem = async (key: string): Promise<string | null> => {
    return storage[key] || null;
  };
  
  const setItem = async (key: string, value: string): Promise<void> => {
    setStorage(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  
  const removeItem = async (key: string): Promise<void> => {
    setStorage(prev => {
      const newStorage = { ...prev };
      delete newStorage[key];
      return newStorage;
    });
  };
  
  return (
    <StorageContext.Provider 
      value={{
        getItem,
        setItem,
        removeItem,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
};