'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, X, Check } from 'lucide-react';
import { FileMetadata, FileReceptionProgress } from '@/lib/file-transfer';

interface FileReceptionNotificationProps {
  receptions: FileReceptionProgress[];
  onDownload: (fileId: string) => void;
  onDismiss: (fileId: string) => void;
}

export function FileReceptionNotification({ 
  receptions, 
  onDownload, 
  onDismiss 
}: FileReceptionNotificationProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTransferSpeed = (bytes: number, startTime: number) => {
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const bytesPerSecond = bytes / elapsedSeconds;
    return formatFileSize(bytesPerSecond) + '/s';
  };

  if (receptions.length === 0) return null;

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 space-y-3">
      {receptions.map((reception) => (
        <div key={reception.fileId} className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 min-w-96 shadow-lg">
          {/* First line: All main info */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-white font-medium truncate">{reception.fileName}</span>
              <span className="text-gray-400">from</span>
              <span className="text-blue-400 font-medium">{reception.senderName}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">{formatFileSize(reception.fileSize)}</span>
              {reception.isComplete && (
                <div className="flex items-center gap-1 text-green-400">
                  <Check className="h-4 w-4" />
                  <span className="text-sm">Complete</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {reception.isComplete && (
                <Button
                  onClick={() => onDownload(reception.fileId)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 h-7 text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(reception.fileId)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {!reception.isComplete && (
            <>
              {/* Progress bar */}
              <Progress 
                value={reception.progress} 
                className="w-full mb-2 h-2"
                indicatorClassName="bg-blue-500"
              />
              
              {/* Second line: Speed and chunks in small text */}
              <div className="flex justify-between text-xs text-gray-400">
                <span>{formatTransferSpeed(reception.fileSize * (reception.progress / 100), reception.startTime)}</span>
                <span>{reception.progress.toFixed(1)}% • {reception.receivedChunks}/{reception.totalChunks} chunks</span>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}