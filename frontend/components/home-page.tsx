'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button"
import { Edit, Users, Wifi, WifiOff, Shuffle, LogOut, Copy, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { InputBadge } from "@/components/ui/input-badge"
import { useWebSocket } from "@/hooks/ws"
import { generateRandomUsername, validateUsername } from "@/lib/username-generator"
import { Header } from '@/components/header';
import { RadarView } from '@/components/radar-view';
import { RoomIdDialog } from '@/components/room-id-dialog';
import { FileSelectorDialog } from '@/components/file-selector-dialog';
import { ReceiveCard } from '@/components/receive-card';
import { FileTransferManager, FileTransferProgress } from '@/lib/file-transfer';
import { Semaphore } from '@/lib/semaphore';

export default function HomePage() {
  const [username, setUsername] = useState("")
  const [editingName, setEditingName] = useState(false)
  const [tempName, setTempName] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const [copied, setCopied] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [showRoomDialog, setShowRoomDialog] = useState(false)
  const [showFileSelectorDialog, setShowFileSelectorDialog] = useState(false)
  const [selectedTargetUser, setSelectedTargetUser] = useState<string>("")
  const [fileTransferProgress, setFileTransferProgress] = useState<FileTransferProgress | null>(null)

  // Generate random username on component mount (client-side only)
  useEffect(() => {
    setIsClient(true)
    const randomUsername = generateRandomUsername()
    setUsername(randomUsername)
    setTempName(randomUsername)
  }, [])
  
  const {
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
  } = useWebSocket(isClient ? username : "")


  const saveName = () => {
    const validation = validateUsername(tempName)
    if (validation.isValid) {
      setUsername(tempName.trim())
      setUsernameError("")
      setEditingName(false)
    } else {
      setUsernameError(validation.error || "Invalid username")
    }
  }

  const generateNewUsername = () => {
    const newUsername = generateRandomUsername()
    setTempName(newUsername)
    setUsernameError("")
  }


  const handleCopyRoomId = async () => {
    if (currentRoom) {
      await navigator.clipboard.writeText(currentRoom)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveName()
    } else if (e.key === 'Escape') {
      setEditingName(false)
      setTempName(username)
      setUsernameError("")
    }
  }

  const handlePeerSelect = (peerId: string) => {
    setSelectedTargetUser(peerId)
    setShowFileSelectorDialog(true)
  }

  const handleFileSelect = async (file: File, targetUser: string) => {
    try {
      
      // Process file into chunks
      const { metadata, chunks } = await FileTransferManager.processFileForTransfer(file)
      
      // Initialize progress tracking
      setFileTransferProgress({
        fileId: metadata.id,
        fileName: metadata.name,
        totalChunks: metadata.chunkCount,
        sentChunks: 0,
        progress: 0
      })

      // Send file metadata first (still JSON)
      sendFileMetadata(metadata)
      
      // Send chunks using binary messages with parallel processing
      const CONCURRENT_CHUNKS = 4 // Send up to 4 chunks in parallel
      const semaphore = new Semaphore(CONCURRENT_CHUNKS)
      let completedChunks = 0

      // Send all chunks in parallel (controlled by semaphore)
      await Promise.all(chunks.map(async (chunk) => {
        await semaphore.acquire()
        try {
          // Create binary message with embedded metadata
          const binaryMessage = FileTransferManager.createBinaryChunkMessage(chunk)
          
          // Send as binary WebSocket message
          sendBinaryChunk(binaryMessage)
          
          // Update progress
          completedChunks++
          const progress = (completedChunks / chunks.length) * 100
          setFileTransferProgress(prev => prev ? {
            ...prev,
            sentChunks: completedChunks,
            progress
          } : null)
          
        } finally {
          semaphore.release()
        }
      }))

      // Send completion status
      sendFileStatus(100)
      
      // Clear progress after a delay
      setTimeout(() => {
        setFileTransferProgress(null)
        setShowFileSelectorDialog(false)
      }, 2000)
      
    } catch (error) {
      console.error('Error during file transfer:', error)
      setFileTransferProgress(null)
    }
  }

  const handleTextSend = async (text: string, targetUser: string) => {
    try {
      // Process text into chunks using the same binary protocol
      const { metadata, chunks } = FileTransferManager.processTextForTransfer(text)
      
      // Initialize progress tracking
      setFileTransferProgress({
        fileId: metadata.id,
        fileName: metadata.name,
        totalChunks: metadata.chunkCount,
        sentChunks: 0,
        progress: 0
      })

      // Send file metadata first
      sendFileMetadata(metadata)
      
      // Send chunks using binary messages with parallel processing
      const CONCURRENT_CHUNKS = 4 // Send up to 4 chunks in parallel
      const semaphore = new Semaphore(CONCURRENT_CHUNKS)
      let completedChunks = 0

      // Send all chunks in parallel (controlled by semaphore)
      await Promise.all(chunks.map(async (chunk) => {
        await semaphore.acquire()
        try {
          // Create binary message with embedded metadata
          const binaryMessage = FileTransferManager.createBinaryChunkMessage(chunk)
          
          // Send as binary WebSocket message
          sendBinaryChunk(binaryMessage)
          
          // Update progress
          completedChunks++
          const progress = (completedChunks / chunks.length) * 100
          setFileTransferProgress(prev => prev ? {
            ...prev,
            sentChunks: completedChunks,
            progress
          } : null)
          
        } finally {
          semaphore.release()
        }
      }))

      // Send completion status
      sendFileStatus(100)
      
      // Clear progress after a delay
      setTimeout(() => {
        setFileTransferProgress(null)
        setShowFileSelectorDialog(false)
      }, 2000)
      
    } catch (error) {
      console.error('Error during text transfer:', error)
      setFileTransferProgress(null)
    }
  }

  // Show loading state during hydration
  if (!isClient) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      </main>
    )
  }

  return (
    <main className="h-screen bg-black text-white flex flex-col overflow-hidden">
      <Header />

      <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 relative overflow-hidden">
        {/* Connection Status */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
          <Badge 
            variant="outline" 
            className={`text-xs sm:text-sm ${isConnected ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}
          >
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3 sm:mr-1" />
                <span className="hidden sm:inline">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 sm:mr-1" />
                <span className="hidden sm:inline">Disconnected</span>
              </>
            )}
          </Badge>
        </div>

        {/* Main Content */}
        <div className="relative w-full max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl aspect-square flex-shrink-0">
          <RadarView 
            onPeerSelect={handlePeerSelect} 
            roomUsers={roomUsers}
            currentUsername={username}
          />
          
          {/* Icon Container - Centered */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-10 h-10 text-blue-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>
          </div>
          
          {/* Text Container - Positioned below the Icon */}
          <div
            className="absolute left-1/2 px-2"
            style={{ top: "calc(50% + 2.5rem)", transform: "translateX(-50%)" }}
          >
            {editingName ? (
              <div className="flex flex-col items-center gap-1 sm:gap-2">
                <div className="flex items-center gap-1 sm:gap-2">
                  <InputBadge
                    value={tempName}
                    onChange={(e) => {
                      setTempName(e.target.value)
                      setUsernameError("")
                    }}
                    onBlur={saveName}
                    onKeyPress={handleKeyPress}
                    variant="outline"
                    className={`text-sm sm:text-base bg-gray-600/80 text-gray-100 border-gray-500/30 cursor-pointer focus:ring-gray-500 focus:border-gray-500 ${
                      usernameError ? 'border-red-500/50 focus:border-red-500' : ''
                    }`}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={generateNewUsername}
                    className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-gray-400 hover:text-gray-200"
                    title="Generate new random username"
                  >
                    <Shuffle className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
                {usernameError && (
                  <p className="text-xs text-red-400 text-center max-w-xs">{usernameError}</p>
                )}
                <p className="text-xs text-gray-400 text-center hidden sm:block">
                  Press Enter to save, Escape to cancel
                </p>
              </div>
            ) : (
              <Badge
                variant="outline"
                className="text-sm sm:text-base bg-gray-600/80 text-gray-100 border-gray-500/30 cursor-pointer hover:bg-gray-500/20 transition-colors"
                onClick={() => {
                  setTempName(username);
                  setEditingName(true);
                }}
              >
                {username}
                <Edit className="h-3 w-3 ml-1" />
              </Badge>
            )}
          </div>
        </div>

        {!currentRoom ? (
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3 w-full max-w-xs sm:max-w-none justify-center">
            <Button
              variant="outline"
              className="text-blue-400 border-blue-500/30 h-10 sm:h-auto"
              onClick={() => joinRoom("public")}
              disabled={!isConnected}
            >
              <Users className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Join Public Room</span>
              <span className="sm:hidden ml-2">Public</span>
            </Button>
            <Button
              variant="outline"
              className="text-green-400 border-green-500/30 h-10 sm:h-auto"
              onClick={() => setShowRoomDialog(true)}
              disabled={!isConnected}
            >
              <span className="hidden sm:inline">Join Custom Room</span>
              <span className="sm:hidden">Custom Room</span>
            </Button>
          </div>
        ) : (
          <div className="mt-4 sm:mt-6 flex items-center justify-center px-2">
            <div className="flex items-center flex-wrap justify-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-md px-2 sm:px-3 py-2 max-w-full">
              <code className="text-xs sm:text-sm bg-blue-500/20 px-2 py-1 rounded text-blue-300 truncate max-w-32 sm:max-w-none">
                {currentRoom}
              </code>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyRoomId}
                  className="h-6 w-6 p-0 text-blue-400 hover:text-blue-300"
                  title="Copy room ID"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
                <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-xs">
                  {roomUsers.length}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={leaveRoom}
                  className="text-red-400 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 h-6 w-6 p-0 sm:px-2 sm:w-auto"
                  title="Leave room"
                >
                  <LogOut className="h-3 w-3" />
                  <span className="hidden sm:inline ml-1">Leave</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>


      <RoomIdDialog
        isOpen={showRoomDialog}
        onOpenChange={setShowRoomDialog}
        onJoinRoom={joinRoom}
        isConnected={isConnected}
      />

      <FileSelectorDialog
        isOpen={showFileSelectorDialog}
        onOpenChange={setShowFileSelectorDialog}
        targetUser={selectedTargetUser}
        onFileSelect={handleFileSelect}
        onTextSend={handleTextSend}
        isUploading={fileTransferProgress !== null}
        uploadProgress={fileTransferProgress?.progress || 0}
      />

      <ReceiveCard
        receptions={fileReceptions}
        textReceptions={textReceptions}
        onDownload={downloadFile}
        onDismiss={dismissFileReception}
        onDismissText={dismissTextReception}
        onCopyText={copyTextToClipboard}
        onCopyFileText={copyFileTextToClipboard}
      />
      
    </main>
  )
}
