import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, UserPlus } from "lucide-react"

type Peer = {
  id: string
  name: string
  avatar: string
  status: "online" | "offline"
  lastSeen?: string
}

const peers: Peer[] = [
  {
    id: "1",
    name: "Alex Chen",
    avatar: "/placeholder-user.jpg",
    status: "online",
  },
  {
    id: "2",
    name: "Taylor Kim",
    avatar: "/placeholder-user.jpg",
    status: "online",
  },
  {
    id: "3",
    name: "Jordan Smith",
    avatar: "/placeholder-user.jpg",
    status: "offline",
    lastSeen: "2 hours ago",
  },
  {
    id: "4",
    name: "Morgan Lee",
    avatar: "/placeholder-user.jpg",
    status: "online",
  },
]

export function PeerConnections() {
  return (
    <Card className="bg-secondary/30 border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Connected Peers</span>
          <Button size="sm" variant="outline" className="gap-1">
            <UserPlus className="h-4 w-4" />
            <span>Add Peer</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {peers.map((peer) => (
            <div key={peer.id} className="flex items-center p-3 rounded-lg bg-background/60 border border-border/40">
              <Avatar className="h-10 w-10 mr-3 border border-border/40">
                <AvatarImage src={peer.avatar} alt={peer.name} />
                <AvatarFallback>{peer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <p className="font-medium truncate">{peer.name}</p>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {peer.status === "online" ? (
                    <div className="flex items-center">
                      <Wifi className="h-3 w-3 mr-1 text-green-500" />
                      <span>Online</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <WifiOff className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span>Last seen {peer.lastSeen}</span>
                    </div>
                  )}
                </div>
              </div>
              <Badge
                variant={peer.status === "online" ? "default" : "outline"}
                className={`ml-2 ${peer.status === "online" ? "bg-green-500/20 text-green-500 hover:bg-green-500/20" : ""}`}
              >
                {peer.status === "online" ? "Connected" : "Offline"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

