"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, UserPlus, MessageSquare, LogOut, Copy, Check, Users, UserCheck } from "lucide-react"

interface PeerConnectionsProps {
  roomUsers: string[]
  currentRoom: string | null
  currentUsername: string
  onJoinRoom: (roomId: string) => void
  onOpenRoomPanel: () => void
  onLeaveRoom: () => void
}

export function PeerConnections({ 
  roomUsers, 
  currentRoom, 
  currentUsername, 
  onJoinRoom, 
  onOpenRoomPanel,
  onLeaveRoom
}: PeerConnectionsProps) {
  const otherUsers = roomUsers.filter(user => user !== currentUsername)
  const [copied, setCopied] = useState(false)
  const [newUsers, setNewUsers] = useState<string[]>([])
  
  // Track new users joining for visual feedback
  useEffect(() => {
    const currentOtherUsers = roomUsers.filter(user => user !== currentUsername)
    
    // Only highlight users that are actually new (not in the previous render)
    const previousUsers = newUsers.filter(user => user !== currentUsername)
    const actuallyNewUsers = currentOtherUsers.filter(user => !previousUsers.includes(user))
    
    if (actuallyNewUsers.length > 0) {
      console.log("New users detected:", actuallyNewUsers)
      setNewUsers(actuallyNewUsers)
      
      // Clear the "new" status after a short delay
      const timer = setTimeout(() => {
        setNewUsers([])
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [roomUsers, currentUsername])

  const handleConnectToPeer = (username: string) => {
    const newRoomId = `${currentUsername}-${username}-${Date.now()}`
    onJoinRoom(newRoomId)
  }

  const handleCopyRoomId = async () => {
    if (currentRoom) {
      await navigator.clipboard.writeText(currentRoom)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card className="bg-secondary/30 border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Connected Peers</span>
          <Button size="sm" variant="outline" className="gap-1" onClick={onOpenRoomPanel}>
            <UserPlus className="h-4 w-4" />
            <span>Join Room</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {currentRoom && (
          <div className="mb-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="font-medium text-blue-400 mb-1">Connected to Room</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-blue-500/20 px-2 py-1 rounded text-blue-300 font-mono">
                    {currentRoom}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyRoomId}
                    className="h-6 w-6 p-0 text-blue-400 hover:text-blue-300"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/20">
                  {roomUsers.length} {roomUsers.length === 1 ? 'user' : 'users'}
                </Badge>
                {otherUsers.length > 0 && (
                  <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/20">
                    {otherUsers.length} online
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-blue-300/70">
                Share this room ID with others to connect
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={onLeaveRoom}
                className="gap-1 text-red-400 border-red-500/30 hover:bg-red-500/10"
              >
                <LogOut className="h-3 w-3" />
                Leave Room
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-muted-foreground">
              {currentRoom ? `Users in ${currentRoom}` : 'Room Members'}
            </h4>
            {otherUsers.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {otherUsers.length + 1} total
              </Badge>
            )}
          </div>
          
          {currentRoom && (
            <div className="grid grid-cols-1 gap-3">
              {/* Current User */}
              <div className="flex items-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <Avatar className="h-10 w-10 mr-3 border border-blue-500/30">
                  <AvatarImage src="/placeholder-user.jpg" alt={currentUsername} />
                  <AvatarFallback className="bg-blue-900/50 text-blue-100">
                    {currentUsername.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{currentUsername}</p>
                    <Badge className="bg-blue-500/20 text-blue-400 text-xs">You</Badge>
                  </div>
                  <div className="flex items-center text-xs text-blue-300">
                    <Wifi className="h-3 w-3 mr-1" />
                    <span>Connected</span>
                  </div>
                </div>
              </div>

              {/* Other Users */}
              {otherUsers.length > 0 ? (
                otherUsers.map((username) => {
                  const isNewUser = newUsers.includes(username)
                  return (
                    <div key={username} className={`flex items-center p-3 rounded-lg border transition-all duration-500 ${
                      isNewUser 
                        ? 'bg-green-500/10 border-green-500/30 animate-pulse' 
                        : 'bg-background/60 border-border/40'
                    }`}>
                      <Avatar className="h-10 w-10 mr-3 border border-border/40">
                        <AvatarImage src="/placeholder-user.jpg" alt={username} />
                        <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{username}</p>
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Online" />
                          {isNewUser && (
                            <Badge className="bg-green-500/20 text-green-500 text-xs animate-bounce">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Just joined
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Wifi className="h-3 w-3 mr-1 text-green-500" />
                          <span>Online in room</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="gap-1"
                          onClick={() => handleConnectToPeer(username)}
                        >
                          <MessageSquare className="h-3 w-3" />
                          <span>Connect</span>
                        </Button>
                        <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/20">
                          Online
                        </Badge>
                      </div>
                    </div>
                  )
                })
              
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-8 w-8 text-muted-foreground/50" />
                    <p className="font-medium">Waiting for others to join</p>
                    <p className="text-sm">Share the room ID "{currentRoom}" to invite others</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {!currentRoom && (
            <div className="text-center py-8 text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <WifiOff className="h-8 w-8 text-muted-foreground/50" />
                <p className="font-medium">Not connected to any room</p>
                <p className="text-sm">Join a room to connect with others</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}