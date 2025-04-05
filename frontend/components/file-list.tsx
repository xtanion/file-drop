import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Download, Share2, FileText, FileImage, FileArchive, Clock } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

type FileItem = {
  id: string
  name: string
  type: "document" | "image" | "archive"
  size: string
  shared: boolean
  date: string
  owner: {
    name: string
    avatar: string
  }
}

const files: FileItem[] = [
  {
    id: "1",
    name: "Project Proposal.pdf",
    type: "document",
    size: "2.4 MB",
    shared: true,
    date: "2 hours ago",
    owner: {
      name: "Alex",
      avatar: "/placeholder-user.jpg",
    },
  },
  {
    id: "2",
    name: "Design Assets.zip",
    type: "archive",
    size: "34.2 MB",
    shared: true,
    date: "Yesterday",
    owner: {
      name: "Sam",
      avatar: "/placeholder-user.jpg",
    },
  },
  {
    id: "3",
    name: "Team Photo.jpg",
    type: "image",
    size: "5.8 MB",
    shared: false,
    date: "3 days ago",
    owner: {
      name: "You",
      avatar: "/placeholder-user.jpg",
    },
  },
  {
    id: "4",
    name: "Product Roadmap.pdf",
    type: "document",
    size: "1.2 MB",
    shared: false,
    date: "1 week ago",
    owner: {
      name: "You",
      avatar: "/placeholder-user.jpg",
    },
  },
]

const getFileIcon = (type: FileItem["type"]) => {
  switch (type) {
    case "document":
      return <FileText className="h-10 w-10 text-blue-500" />
    case "image":
      return <FileImage className="h-10 w-10 text-green-500" />
    case "archive":
      return <FileArchive className="h-10 w-10 text-amber-500" />
    default:
      return <FileText className="h-10 w-10 text-gray-500" />
  }
}

export function FileList() {
  return (
    <div className="space-y-4">
      {files.map((file) => (
        <Card key={file.id} className="p-4 hover:bg-secondary/50 transition-colors">
          <div className="flex items-center">
            <div className="mr-4">{getFileIcon(file.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-base truncate">{file.name}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      <span>Download</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="mr-2 h-4 w-4" />
                      <span>Share</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <span>{file.size}</span>
                <span className="mx-2">•</span>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{file.date}</span>
                </div>
                {file.shared && (
                  <>
                    <span className="mx-2">•</span>
                    <Badge variant="outline" className="text-xs font-normal">
                      Shared
                    </Badge>
                  </>
                )}
              </div>
            </div>
            <div className="ml-4 flex items-center">
              <Avatar className="h-6 w-6">
                <AvatarImage src={file.owner.avatar} alt={file.owner.name} />
                <AvatarFallback>{file.owner.name[0]}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

