"use client"

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type ClientOption = {
  value: string;
  label: string;
};

interface ClientContextType {
  selectedClient: ClientOption | undefined;
  setSelectedClient: (client: ClientOption) => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedClient, setSelectedClient] = useState<ClientOption | undefined>(undefined);

  // Load selected client from localStorage on initial render
  useEffect(() => {
    const savedClient = localStorage.getItem('selectedClient');
    if (savedClient) {
      try {
        setSelectedClient(JSON.parse(savedClient));
      } catch (e) {
        console.error('Failed to parse saved client:', e);
      }
    }
  }, []);

  return (
    <ClientContext.Provider value={{ 
      selectedClient, 
      setSelectedClient
    }}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClient = (): ClientContextType => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
};
