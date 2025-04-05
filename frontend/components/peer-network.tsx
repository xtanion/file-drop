"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CircularProgress } from "@/components/circular-progress"
import { motion } from "framer-motion"

type Peer = {
  id: string
  name: string
  avatar: string
  initials: string
  transfers: Transfer[]
}

type Transfer = {
  id: string
  fileName: string
  progress: number
  direction: "upload" | "download"
}

// Sample data
const peers: Peer[] = [
  {
    id: "1",
    name: "Alex Chen",
    avatar: "/placeholder-user.jpg",
    initials: "AC",
    transfers: [
      { id: "t1", fileName: "Project.pdf", progress: 45, direction: "upload" },
      { id: "t2", fileName: "Notes.txt", progress: 78, direction: "download" },
    ],
  },
  {
    id: "2",
    name: "Taylor Kim",
    avatar: "/placeholder-user.jpg",
    initials: "TK",
    transfers: [{ id: "t3", fileName: "Photos.zip", progress: 62, direction: "download" }],
  },
  {
    id: "3",
    name: "Morgan Lee",
    avatar: "/placeholder-user.jpg",
    initials: "ML",
    transfers: [],
  },
  {
    id: "4",
    name: "Jordan Smith",
    avatar: "/placeholder-user.jpg",
    initials: "JS",
    transfers: [{ id: "t4", fileName: "Video.mp4", progress: 23, direction: "upload" }],
  },
  {
    id: "5",
    name: "Casey Wong",
    avatar: "/placeholder-user.jpg",
    initials: "CW",
    transfers: [{ id: "t5", fileName: "Design.fig", progress: 91, direction: "upload" }],
  },
]

interface PeerNetworkProps {
  onPeerSelect: (peerId: string) => void
}

export function PeerNetwork({ onPeerSelect }: PeerNetworkProps) {
  const [peerData, setPeerData] = useState(peers)

  // Simulate progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPeerData((prev) =>
        prev.map((peer) => ({
          ...peer,
          transfers: peer.transfers.map((transfer) => {
            if (transfer.progress < 100) {
              const increment = Math.random() * 5
              const newProgress = Math.min(transfer.progress + increment, 100)
              return { ...transfer, progress: newProgress }
            }
            return transfer
          }),
        })),
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Calculate positions in a circle
  const getPosition = (index: number, total: number, radius: number) => {
    const angle = (index / total) * 2 * Math.PI
    const x = radius * Math.cos(angle)
    const y = radius * Math.sin(angle)
    return { x, y }
  }

  return (
    <div className="relative h-[500px] w-full max-w-[800px]">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-24 w-24 rounded-full bg-secondary/20 flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Your Network</span>
        </div>
      </div>

      {peerData.map((peer, index) => {
        const position = getPosition(index, peerData.length, 180)
        const hasTransfers = peer.transfers.length > 0

        return (
          <motion.div
            key={peer.id}
            className="absolute"
            style={{
              left: "calc(50% + " + position.x + "px)",
              top: "calc(50% + " + position.y + "px)",
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="relative -translate-x-1/2 -translate-y-1/2">
              {hasTransfers && (
                <div className="absolute inset-0 -m-2">
                  {peer.transfers.map((transfer, tIndex) => (
                    <CircularProgress
                      key={transfer.id}
                      value={transfer.progress}
                      size={72 + tIndex * 8}
                      strokeWidth={3}
                      color={transfer.direction === "upload" ? "#3b82f6" : "#10b981"}
                    />
                  ))}
                </div>
              )}

              <button onClick={() => onPeerSelect(peer.id)} className="relative z-10 group">
                <Avatar className="h-16 w-16 border-2 border-green-500 ring-2 ring-green-500/20 group-hover:ring-4 group-hover:ring-green-500/30 transition-all">
                  <AvatarImage src={peer.avatar} alt={peer.name} />
                  <AvatarFallback className="bg-green-900 text-green-100">{peer.initials}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-black"></div>
                <div className="opacity-0 group-hover:opacity-100 absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-background/90 text-xs px-2 py-1 rounded transition-opacity">
                  {peer.name}
                </div>
              </button>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

