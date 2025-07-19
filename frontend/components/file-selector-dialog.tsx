'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Upload, File, X, MessageSquare, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface FileSelectorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  targetUser: string;
  onFileSelect: (file: File, targetUser: string) => void;
  onTextSend: (text: string, targetUser: string) => void;
  isUploading?: boolean;
  uploadProgress?: number;
}

export function FileSelectorDialog({ 
  isOpen, 
  onOpenChange, 
  targetUser, 
  onFileSelect,
  onTextSend,
  isUploading = false,
  uploadProgress = 0 
}: FileSelectorDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [mode, setMode] = useState<'file' | 'text'>('file');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleSendFile = () => {
    if (selectedFile) {
      onFileSelect(selectedFile, targetUser);
      setSelectedFile(null);
    }
  };

  const handleSendText = () => {
    if (textContent.trim()) {
      onTextSend(textContent.trim(), targetUser);
      setTextContent('');
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= 1500) {
      setTextContent(text);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setTextContent('');
    setMode('file');
    onOpenChange(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full h-full sm:h-auto sm:max-w-[500px] bg-gray-900 border-gray-700 sm:rounded-lg rounded-none flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white">Send to {targetUser}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose to send a file or text message to this user.
          </DialogDescription>
        </DialogHeader>

        {/* Mode selector */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={mode === 'file' ? 'default' : 'outline'}
            onClick={() => setMode('file')}
            className="flex items-center gap-2 flex-1"
            size="sm"
          >
            <File className="h-4 w-4" />
            File
          </Button>
          <Button
            variant={mode === 'text' ? 'default' : 'outline'}
            onClick={() => setMode('text')}
            className="flex items-center gap-2 flex-1"
            size="sm"
          >
            <MessageSquare className="h-4 w-4" />
            Text
          </Button>
        </div>

        <div className="grid gap-4 py-4 flex-1 overflow-auto">
          {isUploading ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-white mb-2">Sending {selectedFile?.name || 'content'}...</p>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-gray-400 mt-2">{uploadProgress.toFixed(1)}% complete</p>
              </div>
            </div>
          ) : mode === 'file' ? (
            <>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-400 bg-blue-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="space-y-2">
                    <File className="h-12 w-12 text-green-400 mx-auto" />
                    <p className="text-white font-medium">{selectedFile.name}</p>
                    <p className="text-gray-400 text-sm">{formatFileSize(selectedFile.size)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileSelect(null)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-white mb-2">Drop a file here, or click to select</p>
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-400 border-gray-600 hover:bg-gray-800"
                      >
                        Choose File
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                className="hidden"
                accept="*/*"
              />
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="text-content" className="text-white">
                  Text Message
                </Label>
                <Textarea
                  id="text-content"
                  value={textContent}
                  onChange={handleTextChange}
                  placeholder="Enter your text message here... (max 1500 characters)"
                  className="mt-2 bg-gray-800 border-gray-600 text-white placeholder-gray-400 min-h-[120px] resize-none"
                  maxLength={1500}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">
                    {textContent.length}/1500 characters
                  </span>
                  {textContent.length > 1400 && (
                    <span className="text-xs text-yellow-400">
                      {1500 - textContent.length} characters remaining
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isUploading}
            className="text-gray-400 border-gray-600 hover:bg-gray-800 w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={mode === 'file' ? handleSendFile : handleSendText}
            disabled={
              isUploading || 
              (mode === 'file' && !selectedFile) || 
              (mode === 'text' && !textContent.trim())
            }
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 w-full sm:w-auto"
          >
            {mode === 'text' ? (
              <Send className="h-4 w-4" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{isUploading ? 'Sending...' : mode === 'text' ? 'Send Text' : 'Send File'}</span>
            <span className="sm:hidden">{isUploading ? 'Sending...' : 'Send'}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}