'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RoomIdDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onJoinRoom: (roomId: string) => void;
  isConnected: boolean;
}

export function RoomIdDialog({ isOpen, onOpenChange, onJoinRoom, isConnected }: RoomIdDialogProps) {
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  const handleJoinRoom = () => {
    const trimmedRoomId = roomId.trim();
    if (!trimmedRoomId) {
      setError('Please enter a room ID');
      return;
    }
    
    if (trimmedRoomId.length < 2) {
      setError('Room ID must be at least 2 characters long');
      return;
    }

    onJoinRoom(trimmedRoomId);
    setRoomId('');
    setError('');
    onOpenChange(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoinRoom();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomId(e.target.value);
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full h-full sm:h-auto sm:max-w-[425px] bg-gray-900 border-gray-700 sm:rounded-lg rounded-none">
        <DialogHeader>
          <DialogTitle className="text-white">Join Room</DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter a room ID to join a specific room, or create a new one by entering any ID.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 flex-1">
          <div className="space-y-2">
            <Label htmlFor="room-id" className="text-white">
              Room ID
            </Label>
            <Input
              id="room-id"
              value={roomId}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Enter room ID..."
              className="bg-gray-800 text-white placeholder-gray-400"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}
        </div>
        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-gray-400 border-gray-600 hover:bg-gray-800 w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleJoinRoom}
            disabled={!isConnected}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
          >
            Join Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
