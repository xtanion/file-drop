"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { RadarView } from "@/components/radar-view"
import { FileTransferPanel } from "@/components/file-transfer-panel"
import { RoomPanel } from "@/components/room-panel"
import { Button } from "@/components/ui/button"
import { Edit, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { InputBadge } from "@/components/ui/input-badge"

export default function Home() {
  const [username, setUsername] = useState("Anonymous")
  const [editingName, setEditingName] = useState(false)
  const [tempName, setTempName] = useState(username)
  const [showRoomPanel, setShowRoomPanel] = useState(false)
  const [selectedPeerId, setSelectedPeerId] = useState<string | null>(null)

  const saveName = () => {
    if (tempName.trim()) {
      setUsername(tempName.trim())
    }
    setEditingName(false)
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        {!selectedPeerId ? (
          <>
            
            <div className="relative w-full max-w-3xl aspect-square">
              <RadarView onPeerSelect={setSelectedPeerId} />
            
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
                className="absolute left-1/2"
                style={{ top: "calc(50% + 3.0rem)", transform: "translateX(-50%)" }}
              >
                {editingName ? (
                    <InputBadge
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onBlur={saveName}
                      variant="outline"
                      className="bg-gray-600/80 text-gray-100 border-gray-500/30 cursor-pointer focus:ring-gray-500 focus:border-gray-500"
                      autoFocus
                    />

                ) : (
                  <Badge
                    variant="outline"
                    className="bg-gray-600/80 text-gray-100 border-gray-500/30 cursor-pointer hover:bg-gray-500/20 transition-colors"
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


            <div className="mt-6">
              <Button
                variant="outline"
                className="text-blue-400 border-blue-500/30"
                onClick={() => setShowRoomPanel(true)}
              >
                <Users className="h-4 w-4 mr-2" />
                Join Public Room
              </Button>
            </div>
          </>
        ) : (
          <FileTransferPanel peerId={selectedPeerId} onBack={() => setSelectedPeerId(null)} />
        )}
      </div>

      {showRoomPanel && <RoomPanel onClose={() => setShowRoomPanel(false)} />}
    </main>
  )
}
