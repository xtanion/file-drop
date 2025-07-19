"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { FileReceiver, FileReceptionProgress, TextReceptionProgress, FileTransferManager } from "@/lib/file-transfer";

export interface User {
  username: string;
  roomId: string;
}

export interface WebSocketMessage {
  event: string;
  [key: string]: any;
}

export const useWebSocket = (username: string) => {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [roomUsers, setRoomUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [fileReceptions, setFileReceptions] = useState<FileReceptionProgress[]>([]);
  const [textReceptions, setTextReceptions] = useState<TextReceptionProgress[]>([]);
  const [updateCounter, setUpdateCounter] = useState(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileReceiverRef = useRef<FileReceiver>(new FileReceiver());
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    if (!username) return;
    // Browser automatically negotiates compression with server when EnableCompression is true
    const ws = new WebSocket("ws://localhost:6969/ws");
    
    // Optimize WebSocket settings for better performance
    ws.binaryType = 'arraybuffer'; // Use ArrayBuffer for binary data (more efficient than Blob)
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      // Handle binary messages (direct binary chunks from backend)
      if (event.data instanceof ArrayBuffer) {
        try {
          const parsed = FileTransferManager.parseBinaryChunkMessage(event.data);
          const senderName = 'Unknown'; // Binary messages don't include sender info in our current protocol
          
          // Process chunk and update UI immediately
          fileReceiverRef.current.receiveChunk(
            parsed.fileId, 
            parsed.chunkIndex, 
            parsed.data,
            senderName
          ).then(() => {
            // Use requestAnimationFrame for better performance
            requestAnimationFrame(() => {
              updateReceptions();
            });
          }).catch(error => {
            console.error("Error processing binary chunk:", error);
          });
        } catch (parseError) {
          console.error("Failed to parse binary chunk:", parseError);
        }
        return;
      }
      
      try {
        const data = JSON.parse(event.data);
        
        setMessages(prev => [...prev, data]);

        switch (data.event) {
          case "room-users":
            setRoomUsers(data.users || []);
            setCurrentRoom(data.room);
            break;
          case "user-joined":
            if (data.username && data.username !== username) {
              setRoomUsers(prev => 
                prev.includes(data.username) ? prev : [...prev, data.username]
              );
              setNotifications(prev => [...prev, `${data.username} joined the room`]);
            }
            break;
          case "user-left":
            if (data.username) {
              setRoomUsers(prev => prev.filter(user => user !== data.username));
              setNotifications(prev => [...prev, `${data.username} left the room`]);
            }
            break;
          case "room-joined":
            setCurrentRoom(data.room);
            setRoomUsers(data.users || []);
            break;
          case "room-left":
            setCurrentRoom(null);
            setRoomUsers([]);
            break;
          case "test-success":
            break;
          case "room-full":
            setNotifications(prev => [...prev, `Room is full (${data.current_users}/${data.max_users} users). Please try a different room.`]);
            break;
          case "file-meta":
            try {
              const metadata = data.data;
              const senderName = data.senderName || 'Unknown';
              fileReceiverRef.current.receiveMetadata(metadata, senderName);
              updateReceptions();
            } catch (error) {
              console.error("Error handling file metadata:", error);
            }
            break;
          case "file-chunk":
            // File chunks now come as binary messages, this case should not be hit
            console.warn("Received file-chunk as JSON (should be binary):", data);
            break;
          case "file-status":
            break;
          default:
            break;
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      
      // Only clear room state if it was not a normal close
      if (event.code !== 1000) {
        setCurrentRoom(null);
        setRoomUsers([]);
        setNotifications(prev => [...prev, "Connection lost. Attempting to reconnect..."]);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1000, "Component unmounting");
      }
    };
  }, [username]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }, []);

  const updateFileReceptions = () => {
    const allProgress = fileReceiverRef.current.getAllReceptionProgress();
    
    // Force React re-render with completely new objects
    const forceUpdateTime = Date.now();
    const newReceptions = allProgress.map((p, i) => ({
      ...p,
      _renderKey: `${p.fileId}-${p.receivedChunks}-${forceUpdateTime}-${i}`
    }));
    
    setFileReceptions(newReceptions);
    setUpdateCounter(prev => prev + 1);
  };

  const updateReceptions = () => {
    updateFileReceptions();
    
    // Update text receptions
    const allTextReceptions = fileReceiverRef.current.getAllTextReceptions();
    setTextReceptions([...allTextReceptions]);
  };

  const throttledUpdateFileReceptions = () => {
    // Clear any pending update
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // Schedule update (throttle to max 5 updates per second for better performance)
    updateTimeoutRef.current = setTimeout(() => {
      updateReceptions();
    }, 200);
  };

  const joinRoom = useCallback((roomId: string) => {
    if (!username || username.trim() === "") {
      return;
    }
    
    const message = {
      event: "join-room",
      data: {
        roomId,
        username,
      },
    };
    sendMessage(message);
    setCurrentRoom(roomId);
  }, [sendMessage, username]);

  const sendFileMetadata = useCallback((metadata: any) => {
    sendMessage({
      event: "file-meta",
      data: {
        metadata,
      },
    });
  }, [sendMessage]);

  const sendFileChunk = useCallback((chunk: any) => {
    sendMessage({
      event: "file-chunk",
      data: {
        chunk,
      },
    });
  }, [sendMessage]);

  const sendFileStatus = useCallback((progress: number) => {
    sendMessage({
      event: "file-status",
      data: {
        progress,
      },
    });
  }, [sendMessage]);

  const sendBinaryChunk = useCallback((binaryData: ArrayBuffer) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(binaryData);
    }
  }, []);

  const leaveRoom = useCallback(() => {
    if (currentRoom && socketRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        event: "leave-room",
        data: {
          roomId: currentRoom,
          username,
        },
      };
      sendMessage(message);
    }
    setCurrentRoom(null);
    setRoomUsers([]);
  }, [currentRoom, username, sendMessage]);

  const downloadFile = useCallback((fileId: string) => {
    fileReceiverRef.current.downloadFile(fileId);
  }, []);

  const dismissFileReception = useCallback((fileId: string) => {
    fileReceiverRef.current.dismissReception(fileId);
    updateReceptions(); // Immediate update for dismissal
  }, []);


  const dismissTextReception = useCallback((textId: string) => {
    fileReceiverRef.current.dismissTextReception(textId);
    updateReceptions();
  }, []);

  const copyTextToClipboard = useCallback((textId: string) => {
    fileReceiverRef.current.copyTextToClipboard(textId);
  }, []);

  const copyFileTextToClipboard = useCallback((fileId: string) => {
    fileReceiverRef.current.copyFileTextToClipboard(fileId);
  }, []);

  return {
    isConnected,
    currentRoom,
    roomUsers,
    messages,
    notifications,
    fileReceptions,
    textReceptions,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendFileMetadata,
    sendFileChunk,
    sendFileStatus,
    sendBinaryChunk,
    downloadFile,
    dismissFileReception,
    dismissTextReception,
    copyTextToClipboard,
    copyFileTextToClipboard,
  };
};