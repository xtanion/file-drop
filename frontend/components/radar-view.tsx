"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface RadarViewProps {
  onPeerSelect: (peerId: string) => void
}

type Peer = {
  id: string
  name: string
  avatar: string
  initials: string
  distance: number // 0-1 value representing distance from center
  angle: number // 0-360 degrees
}

// Sample data
const generatePeers = () => {
  const peerData: Peer[] = [
    {
      id: "1",
      name: "Alex Chen",
      avatar: "/placeholder-user.jpg",
      initials: "AC",
      distance: Math.random() * 0.5 + 0.5,
      angle: Math.random() * 360,
    },
    {
      id: "2",
      name: "Taylor Kim",
      avatar: "/placeholder-user.jpg",
      initials: "TK",
      distance: Math.random() * 0.5 + 0.5,
      angle: Math.random() * 360,
    },
    {
      id: "3",
      name: "Morgan Lee",
      avatar: "/placeholder-user.jpg",
      initials: "ML",
      distance: Math.random() * 0.5 + 0.5,
      angle: Math.random() * 360,
    },
  ]
  return peerData
}

export function RadarView({ onPeerSelect }: RadarViewProps) {
  const [peers, setPeers] = useState<Peer[]>([])
  const [showPeers, setShowPeers] = useState(false)

  useEffect(() => {
    // Simulate peer discovery after a delay
    const timer = setTimeout(() => {
      setPeers(generatePeers())
      setShowPeers(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Calculate position based on polar coordinates
  const getPosition = (distance: number, angle: number) => {
    const radius = 50 * distance // % of container
    const radians = (angle * Math.PI) / 180
    const x = radius * Math.cos(radians)
    const y = radius * Math.sin(radians)
    return { x, y }
  }

  return (
    <div className="w-full h-full relative">
      {/* Radar circles */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[95%] h-[95%] rounded-full border border-white/10"></div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[80%] h-[80%] rounded-full border border-white/10"></div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[65%] h-[65%] rounded-full border border-white/10"></div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[50%] h-[50%] rounded-full border border-white/10"></div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[35%] h-[35%] rounded-full border border-white/10"></div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[20%] h-[20%] rounded-full border border-white/10"></div>
      </div>

      {/* Radar sweep animation */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="w-full h-full relative">
          <motion.div
            className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-blue-500/10 origin-left"
            animate={{ rotate: 360 }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        </div>
      </div>

      {/* Peers */}
      <AnimatePresence>
        {showPeers &&
          peers.map((peer) => {
            const position = getPosition(peer.distance, peer.angle)

            return (
              <motion.div
                key={peer.id}
                className="absolute"
                style={{
                  left: `calc(50% + ${position.x}%)`,
                  top: `calc(50% + ${position.y}%)`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.5 }}
              >
                <button
                  onClick={() => onPeerSelect(peer.id)}
                  className="relative -translate-x-1/2 -translate-y-1/2 group"
                >
                  <Avatar className="h-10 w-10 border border-blue-500/30 ring-2 ring-blue-500/10 group-hover:ring-4 group-hover:ring-blue-500/20 transition-all">
                    <AvatarImage src={peer.avatar} alt={peer.name} />
                    <AvatarFallback className="bg-blue-900/50 text-blue-100">{peer.initials}</AvatarFallback>
                  </Avatar>
                  <div className="opacity-0 group-hover:opacity-100 absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-background/90 text-xs px-2 py-1 rounded transition-opacity">
                    {peer.name}
                  </div>
                </button>
              </motion.div>
            )
          })}
      </AnimatePresence>
    </div>
  )
}
