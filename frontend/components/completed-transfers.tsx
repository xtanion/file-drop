import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { FileText, FileImage, FileArchive, ArrowUpFromLine, ArrowDownToLine, Check } from "lucide-react"

type TransferDirection = "sent" | "received"

type CompletedTransfer = {
  id: string
  fileName: string
  fileType: "document" | "image" | "archive"
  fileSize: string
  direction: TransferDirection
  time: string
  peer: {
    name: string
    avatar: string
  }
}

const completedTransfers: CompletedTransfer[] = [
  {
    id: "1",
    fileName: "Meeting Notes.pdf",
    fileType: "document",
    fileSize: "1.2 MB",
    direction: "sent",
    time: "2 hours ago",
    peer: {
      name: "Alex Chen",
      avatar: "/placeholder-user.jpg",
    },
  },
  {
    id: "2",
    fileName: "Logo Design.png",
    fileType: "image",
    fileSize: "3.5 MB",
    direction: "received",
    time: "Yesterday",
    peer: {
      name: "Taylor Kim",
      avatar: "/placeholder-user.jpg",
    },
  },
  {
    id: "3",
    fileName: "Source Code.zip",
    fileType: "archive",
    fileSize: "42.8 MB",
    direction: "sent",
    time: "3 days ago",
    peer: {
      name: "Morgan Lee",
      avatar: "/placeholder-user.jpg",
    },
  },
  {
    id: "4",
    fileName: "Budget Report.pdf",
    fileType: "document",
    fileSize: "5.1 MB",
    direction: "received",
    time: "1 week ago",
    peer: {
      name: "Jordan Smith",
      avatar: "/placeholder-user.jpg",
    },
  },
]

const getFileIcon = (type: CompletedTransfer["fileType"]) => {
  switch (type) {
    case "document":
      return <FileText className="h-4 w-4 text-blue-500" />
    case "image":
      return <FileImage className="h-4 w-4 text-green-500" />
    case "archive":
      return <FileArchive className="h-4 w-4 text-amber-500" />
    default:
      return <FileText className="h-4 w-4 text-gray-500" />
  }
}

export function CompletedTransfers() {
  return (
    <Card className="bg-secondary/30 border-border/40">
      <CardContent className="p-0">
        <div className="divide-y divide-border/40">
          {completedTransfers.map((transfer) => (
            <div key={transfer.id} className="p-4 hover:bg-background/40 transition-colors">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">{getFileIcon(transfer.fileType)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm truncate">{transfer.fileName}</h4>
                    <Check className="h-4 w-4 text-green-500" />
                  </div>

                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <span>{transfer.fileSize}</span>
                    <span className="mx-2">•</span>
                    <span>{transfer.time}</span>
                  </div>

                  <div className="flex items-center mt-2 text-xs">
                    {transfer.direction === "sent" ? (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 gap-1">
                        <ArrowUpFromLine className="h-3 w-3" />
                        <span>Sent to</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 gap-1">
                        <ArrowDownToLine className="h-3 w-3" />
                        <span>Received from</span>
                      </Badge>
                    )}
                    <div className="flex items-center ml-2">
                      <Avatar className="h-4 w-4 mr-1">
                        <AvatarImage src={transfer.peer.avatar} alt={transfer.peer.name} />
                        <AvatarFallback>{transfer.peer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{transfer.peer.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

