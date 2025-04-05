"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Download, FileText, FileImage, FileArchive, FileAudio, Clock, Share2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface PeerFilesProps {
  peerId: string
  onBack: () => void
}

// Sample data
const peers = {
  "1": {
    id: "1",
    name: "Alex Chen",
    avatar: "/placeholder-user.jpg",
    initials: "AC",
    activeTransfers: [
      {
        id: "t1",
        fileName: "Project Presentation.pdf",
        fileType: "document",
        fileSize: "24.5 MB",
        progress: 45,
        direction: "upload",
        speed: "2.4 MB/s",
      },
      {
        id: "t2",
        fileName: "Meeting Notes.txt",
        fileType: "document",
        fileSize: "156 KB",
        progress: 78,
        direction: "download",
        speed: "1.2 MB/s",
      },
    ],
    sharedFiles: [
      {
        id: "f1",
        fileName: "Research Paper.pdf",
        fileType: "document",
        fileSize: "3.2 MB",
        sharedDate: "2 days ago",
      },
      {
        id: "f2",
        fileName: "Team Photo.jpg",
        fileType: "image",
        fileSize: "5.8 MB",
        sharedDate: "1 week ago",
      },
    ],
  },
  "2": {
    id: "2",
    name: "Taylor Kim",
    avatar: "/placeholder-user.jpg",
    initials: "TK",
    activeTransfers: [
      {
        id: "t3",
        fileName: "Vacation Photos.zip",
        fileType: "archive",
        fileSize: "156 MB",
        progress: 62,
        direction: "download",
        speed: "5.8 MB/s",
      },
    ],
    sharedFiles: [
      {
        id: "f3",
        fileName: "Project Roadmap.pdf",
        fileType: "document",
        fileSize: "1.2 MB",
        sharedDate: "Yesterday",
      },
    ],
  },
  "3": {
    id: "3",
    name: "Morgan Lee",
    avatar: "/placeholder-user.jpg",
    initials: "ML",
    activeTransfers: [],
    sharedFiles: [
      {
        id: "f4",
        fileName: "Design Assets.zip",
        fileType: "archive",
        fileSize: "34.2 MB",
        sharedDate: "3 days ago",
      },
      {
        id: "f5",
        fileName: "Podcast Episode.mp3",
        fileType: "audio",
        fileSize: "28.5 MB",
        sharedDate: "1 week ago",
      },
    ],
  },
  "4": {
    id: "4",
    name: "Jordan Smith",
    avatar: "/placeholder-user.jpg",
    initials: "JS",
    activeTransfers: [
      {
        id: "t4",
        fileName: "Product Demo.mp4",
        fileType: "video",
        fileSize: "86.3 MB",
        progress: 23,
        direction: "upload",
        speed: "3.1 MB/s",
      },
    ],
    sharedFiles: [],
  },
  "5": {
    id: "5",
    name: "Casey Wong",
    avatar: "/placeholder-user.jpg",
    initials: "CW",
    activeTransfers: [
      {
        id: "t5",
        fileName: "UI Design.fig",
        fileType: "document",
        fileSize: "12.8 MB",
        progress: 91,
        direction: "upload",
        speed: "4.5 MB/s",
      },
    ],
    sharedFiles: [
      {
        id: "f6",
        fileName: "Brand Guidelines.pdf",
        fileType: "document",
        fileSize: "8.4 MB",
        sharedDate: "4 days ago",
      },
    ],
  },
}

const getFileIcon = (type: string) => {
  switch (type) {
    case "document":
      return <FileText className="h-5 w-5 text-blue-500" />
    case "image":
      return <FileImage className="h-5 w-5 text-green-500" />
    case "archive":
      return <FileArchive className="h-5 w-5 text-amber-500" />
    case "audio":
      return <FileAudio className="h-5 w-5 text-purple-500" />
    default:
      return <FileText className="h-5 w-5 text-gray-500" />
  }
}

export function PeerFiles({ peerId, onBack }: PeerFilesProps) {
  const peer = peers[peerId as keyof typeof peers]

  if (!peer) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-green-500">
            <AvatarImage src={peer.avatar} alt={peer.name} />
            <AvatarFallback>{peer.initials}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">{peer.name}</h2>
            <p className="text-xs text-muted-foreground">Connected</p>
          </div>
        </div>
      </div>

      {peer.activeTransfers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">ACTIVE TRANSFERS</h3>
          <div className="space-y-3">
            {peer.activeTransfers.map((transfer) => (
              <Card key={transfer.id} className="p-3 bg-secondary/30 border-border/40">
                <div className="flex items-center gap-3">
                  {getFileIcon(transfer.fileType)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{transfer.fileName}</p>
                      <span className="text-xs text-muted-foreground">{transfer.speed}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <span>{transfer.fileSize}</span>
                      <span className="mx-2">•</span>
                      <span className={transfer.direction === "upload" ? "text-blue-400" : "text-green-400"}>
                        {transfer.direction === "upload" ? "Sending" : "Receiving"}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span></span>
                        <span>{Math.round(transfer.progress)}%</span>
                      </div>
                      <Progress
                        value={transfer.progress}
                        className="h-1 bg-secondary"
                        indicatorClassName={transfer.direction === "upload" ? "bg-blue-500" : "bg-green-500"}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {peer.sharedFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">SHARED FILES</h3>
          <div className="space-y-2">
            {peer.sharedFiles.map((file) => (
              <Card
                key={file.id}
                className="p-3 bg-secondary/10 border-border/40 hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(file.fileType)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.fileName}</p>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <span>{file.fileSize}</span>
                      <span className="mx-2">•</span>
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{file.sharedDate}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {peer.sharedFiles.length === 0 && peer.activeTransfers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No files shared with this peer yet.</p>
          <Button className="mt-4">Share Files</Button>
        </div>
      )}
    </div>
  )
}

