"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import { motion } from "framer-motion"

interface RoomPanelProps {
  onClose: () => void
}

export function RoomPanel({ onClose }: RoomPanelProps) {
  const [roomName, setRoomName] = useState("")

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-background border border-blue-500/20 rounded-lg w-full max-w-md p-6"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium">Join Public Room</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Enter a room name to connect with others</label>
            <Input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Room name (e.g., meeting-123)"
              className="bg-background/50 border-blue-500/30 focus-visible:ring-blue-500/30"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Anyone with the same room name can discover and connect with you, even on different networks.
          </p>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" disabled={!roomName.trim()}>
              Join Room
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

