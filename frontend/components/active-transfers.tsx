"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowUpFromLine, ArrowDownToLine, FileText, FileImage, FileArchive, Pause, X } from "lucide-react"

type TransferDirection = "upload" | "download"

type Transfer = {
  id: string
  fileName: string
  fileType: "document" | "image" | "archive"
  fileSize: string
  progress: number
  speed: string
  direction: TransferDirection
  peer: {
    name: string
    avatar: string
  }
}

const initialTransfers: Transfer[] = [
  {
    id: "1",
    fileName: "Project Presentation.pdf",
    fileType: "document",
    fileSize: "24.5 MB",
    progress: 45,
    speed: "2.4 MB/s",
    direction: "upload",
    peer: {
      name: "Alex Chen",
      avatar: "/placeholder-user.jpg",
    },
  },
  {
    id: "2",
    fileName: "Vacation Photos.zip",
    fileType: "archive",
    fileSize: "156 MB",
    progress: 72,
    speed: "5.8 MB/s",
    direction: "download",
    peer: {
      name: "Taylor Kim",
      avatar: "/placeholder-user.jpg",
    },
  },
  {
    id: "3",
    fileName: "Design Mockup.png",
    fileType: "image",
    fileSize: "8.2 MB",
    progress: 12,
    speed: "1.2 MB/s",
    direction: "upload",
    peer: {
      name: "Morgan Lee",
      avatar: "/placeholder-user.jpg",
    },
  },
]

const getFileIcon = (type: Transfer["fileType"]) => {
  switch (type) {
    case "document":
      return <FileText className="h-8 w-8 text-blue-500" />
    case "image":
      return <FileImage className="h-8 w-8 text-green-500" />
    case "archive":
      return <FileArchive className="h-8 w-8 text-amber-500" />
    default:
      return <FileText className="h-8 w-8 text-gray-500" />
  }
}

export function ActiveTransfers() {
  const [transfers, setTransfers] = useState<Transfer[]>(initialTransfers)

  // Simulate progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTransfers((prev) =>
        prev.map((transfer) => {
          if (transfer.progress < 100) {
            const increment = Math.random() * 5
            const newProgress = Math.min(transfer.progress + increment, 100)
            return {
              ...transfer,
              progress: newProgress,
              speed: `${(Math.random() * 5 + 1).toFixed(1)} MB/s`,
            }
          }
          return transfer
        }),
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="bg-secondary/30 border-border/40">
      <CardHeader className="pb-3">
        <CardTitle>Active Transfers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transfers.map((transfer) => (
            <div key={transfer.id} className="p-4 rounded-lg bg-background/60 border border-border/40">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">{getFileIcon(transfer.fileType)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">{transfer.fileName}</h3>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pause className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground mt-1 mb-3">
                    <span>{transfer.fileSize}</span>
                    <span className="mx-2">•</span>
                    <span>{transfer.speed}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {transfer.direction === "upload" ? (
                          <>
                            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              <ArrowUpFromLine className="h-3 w-3 mr-1" />
                              Sending to
                            </Badge>
                          </>
                        ) : (
                          <>
                            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                              <ArrowDownToLine className="h-3 w-3 mr-1" />
                              Receiving from
                            </Badge>
                          </>
                        )}
                        <div className="flex items-center">
                          <Avatar className="h-5 w-5 mr-1">
                            <AvatarImage src={transfer.peer.avatar} alt={transfer.peer.name} />
                            <AvatarFallback>{transfer.peer.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{transfer.peer.name}</span>
                        </div>
                      </div>
                      <span className="font-medium">{Math.round(transfer.progress)}%</span>
                    </div>
                    <Progress
                      value={transfer.progress}
                      className="h-2 bg-secondary"
                      indicatorClassName={transfer.direction === "upload" ? "bg-blue-500" : "bg-green-500"}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {transfers.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              No active transfers. Share a file to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

