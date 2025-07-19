import React, { createContext, useContext } from 'react';
import { useWebSocket, WebSocketMessage } from '@/hooks/ws';

interface WebSocketContextType {
  isConnected: boolean;
  currentRoom: string | null;
  roomUsers: string[];
  messages: WebSocketMessage[];
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  sendMessage: (message: WebSocketMessage) => void;
  sendFileMetadata: (metadata: any) => void;
  sendFileChunk: (chunk: any) => void;
  sendFileStatus: (progress: number) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode, username: string }> = ({ children, username }) => {
  const ws = useWebSocket(username);
  return (
    <WebSocketContext.Provider value={ws}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};