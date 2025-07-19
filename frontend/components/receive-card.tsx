'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, X, Check, Inbox, Copy, Link, MessageSquare } from 'lucide-react';
import { FileReceptionProgress, TextReceptionProgress } from '@/lib/file-transfer';

interface ReceiveCardProps {
  receptions: FileReceptionProgress[];
  textReceptions: TextReceptionProgress[];
  onDownload: (fileId: string) => void;
  onDismiss: (fileId: string) => void;
  onDismissText: (textId: string) => void;
  onCopyText: (textId: string) => void;
  onCopyFileText: (fileId: string) => void;
}

export function ReceiveCard({ 
  receptions, 
  textReceptions,
  onDownload, 
  onDismiss,
  onDismissText,
  onCopyText,
  onCopyFileText
}: ReceiveCardProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTransferSpeed = (bytes: number, startTime: number) => {
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    if (elapsedSeconds < 1) return '0 KB/s';
    const bytesPerSecond = bytes / elapsedSeconds;
    return formatFileSize(bytesPerSecond) + '/s';
  };

  if (receptions.length === 0 && textReceptions.length === 0) return null;

  const activeTransfers = receptions.filter(r => !r.isComplete);
  const completedTransfers = receptions.filter(r => r.isComplete);

  return (
    <div className="fixed bottom-2 right-2 left-2 sm:bottom-4 sm:right-4 sm:left-auto z-50 sm:w-96">
      <Card className="bg-gray-900 border-gray-700 shadow-xl">
        <CardHeader className="pb-2 sm:pb-3">
          <div className="flex items-center gap-2">
            <Inbox className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
            <CardTitle className="text-white text-base sm:text-lg">
              Receiving
            </CardTitle>
            <span className="text-gray-400 text-xs sm:text-sm">
              ({receptions.length + textReceptions.length})
            </span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Text receptions */}
          {textReceptions.map((textReception) => (
            <div key={textReception.textId} className="flex items-center justify-between p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {textReception.type === 'link' ? (
                  <Link className="h-4 w-4 text-green-400 flex-shrink-0" />
                ) : (
                  <MessageSquare className="h-4 w-4 text-green-400 flex-shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">
                      {textReception.type === 'link' ? 'Link' : 'Text'}
                    </span>
                    <span className="text-gray-400 text-sm">
                      from {textReception.senderName}
                    </span>
                  </div>
                  <div className="text-xs text-gray-300 truncate max-w-xs">
                    {textReception.content}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  onClick={() => onCopyText(textReception.textId)}
                  className="bg-green-600 hover:bg-green-700 text-white px-1 sm:px-2 py-1 h-6 sm:h-7 text-xs"
                >
                  <Copy className="h-3 w-3 sm:mr-1" />
                  <span className="hidden sm:inline">Copy</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDismissText(textReception.textId)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}

          {/* Active transfers */}
          {activeTransfers.map((reception) => (
            <div key={reception.fileId} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium truncate">
                        {reception.fileName}
                      </span>
                      <span className="text-gray-400 text-sm">
                        from {reception.senderName}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatFileSize(reception.fileSize)} • {formatTransferSpeed(reception.fileSize * (reception.progress / 100), reception.startTime)}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDismiss(reception.fileId)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200 flex-shrink-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="space-y-1">
                <Progress 
                  key={reception._renderKey || `${reception.fileId}-${reception.progress}-${Date.now()}`}
                  value={reception.progress} 
                  className="w-full h-2"
                  indicatorClassName="bg-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{reception.progress.toFixed(1)}%</span>
                  <span>{reception.receivedChunks}/{reception.totalChunks} chunks</span>
                </div>
              </div>
            </div>
          ))}

          {/* Completed transfers */}
          {completedTransfers.map((reception) => {
            const isTextFile = reception.fileName === 'Text message.txt' || reception.fileName.endsWith('.txt');
            
            return (
              <div key={reception.fileId} className="flex items-center justify-between p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {isTextFile ? (
                    <MessageSquare className="h-4 w-4 text-green-400 flex-shrink-0" />
                  ) : (
                    <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium truncate">
                        {isTextFile ? 'Text Message' : reception.fileName}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {isTextFile ? `${formatFileSize(reception.fileSize)} • Text` : `${formatFileSize(reception.fileSize)} • Complete`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => {
                      if (isTextFile) {
                        onCopyFileText(reception.fileId);
                      } else {
                        onDownload(reception.fileId);
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-1 sm:px-2 py-1 h-6 sm:h-7 text-xs"
                  >
                    {isTextFile ? (
                      <>
                        <Copy className="h-3 w-3 sm:mr-1" />
                        <span className="hidden sm:inline">Copy</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-3 w-3 sm:mr-1" />
                        <span className="hidden sm:inline">Download</span>
                      </>
                    )}
                  </Button>
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
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
