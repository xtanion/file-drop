"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface RoomPanelProps {
  onClose: () => void
  onJoinRoom: (roomId: string) => void
  username: string
}

export function RoomPanel({ onClose, onJoinRoom, username }: RoomPanelProps) {
  const [roomId, setRoomId] = useState("")

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      onJoinRoom(roomId.trim())
      onClose()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoinRoom()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Join a Room</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="room-id" className="block text-sm font-medium text-gray-300 mb-2">
              Room ID
            </label>
            <Input
              id="room-id"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
              autoFocus
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 text-gray-300 border-gray-600 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoinRoom}
              disabled={!roomId.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Join Room
            </Button>
          </div>
        </div>
        
        <p className="text-xs text-gray-400 mt-4 text-center">
          Press Enter to join, Escape to cancel
        </p>
      </div>
    </div>
  )
}