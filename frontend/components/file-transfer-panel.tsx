"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, FileText, FileImage, FileArchive, FileAudio, X, Upload } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"

interface FileTransferPanelProps {
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
  },
  "2": {
    id: "2",
    name: "Taylor Kim",
    avatar: "/placeholder-user.jpg",
    initials: "TK",
  },
  "3": {
    id: "3",
    name: "Morgan Lee",
    avatar: "/placeholder-user.jpg",
    initials: "ML",
  },
}

const getFileIcon = (type: string) => {
  switch (type) {
    case "document":
      return <FileText className="h-5 w-5 text-blue-400" />
    case "image":
      return <FileImage className="h-5 w-5 text-blue-400" />
    case "archive":
      return <FileArchive className="h-5 w-5 text-blue-400" />
    case "audio":
      return <FileAudio className="h-5 w-5 text-blue-400" />
    default:
      return <FileText className="h-5 w-5 text-blue-400" />
  }
}

export function FileTransferPanel({ peerId, onBack }: FileTransferPanelProps) {
  const peer = peers[peerId as keyof typeof peers]
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  if (!peer) return null

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const startUpload = () => {
    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + Math.random() * 10
        if (newProgress >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsUploading(false)
            setFiles([])
          }, 500)
          return 100
        }
        return newProgress
      })
    }, 300)
  }

  return (
    <motion.div
      className="w-full max-w-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-blue-400">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-blue-500/30">
            <AvatarImage src={peer.avatar} alt={peer.name} />
            <AvatarFallback className="bg-blue-900/50 text-blue-100">{peer.initials}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-medium">{peer.name}</h2>
            <p className="text-xs text-blue-400">Connected</p>
          </div>
        </div>
      </div>

      <Card
        className={`border-dashed border ${
          isDragging ? "border-blue-500 bg-blue-500/5" : "border-blue-500/30 bg-transparent"
        } rounded-lg`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center py-12 text-center p-4">
          {isUploading ? (
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Sending files to {peer.name}</span>
                <span className="text-blue-400">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-1 bg-blue-950/30" indicatorClassName="bg-blue-500" />
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">Send files to {peer.name}</h3>
              <p className="text-muted-foreground mb-6">Drag and drop files here or select them from your device</p>
              <input type="file" id="file-upload" className="hidden" multiple onChange={handleFileChange} />
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer border-blue-500/30 text-blue-400" as="span">
                  Select Files
                </Button>
              </label>
            </>
          )}
        </div>
      </Card>

      {files.length > 0 && !isUploading && (
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-3 text-muted-foreground">SELECTED FILES ({files.length})</h3>
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-blue-950/20 border border-blue-500/10 rounded-md"
              >
                <div className="flex items-center">
                  {getFileIcon(file.type.split("/")[0])}
                  <div className="ml-3">
                    <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-white"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={startUpload}>
              Send to {peer.name}
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

