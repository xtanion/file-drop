"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, File, X } from "lucide-react"

export function FileUpload() {
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)

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

  return (
    <div className="w-full max-w-md">
      <Card
        className={`border-dashed border ${
          isDragging ? "border-primary bg-primary/5" : "border-border/30"
        } rounded-lg bg-transparent`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-6 text-center">
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm mb-3">Drag files or click to browse</p>
          <input type="file" id="file-upload" className="hidden" multiple onChange={handleFileChange} />
          <label htmlFor="file-upload">
            <Button variant="outline" size="sm" className="cursor-pointer" as="span">
              Select Files
            </Button>
          </label>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className="mt-4">
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-secondary/20 rounded-md">
                <div className="flex items-center">
                  <File className="h-4 w-4 mr-2 text-primary" />
                  <div>
                    <p className="text-xs font-medium truncate max-w-[180px]">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(index)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-end">
            <Button size="sm">Share with Peers</Button>
          </div>
        </div>
      )}
    </div>
  )
}

