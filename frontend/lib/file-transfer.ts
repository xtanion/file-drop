export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  id: string;
  chunkCount: number;
  chunkSize: number;
}

export interface FileChunk {
  fileId: string;
  chunkIndex: number;
  data: ArrayBuffer;
  isLastChunk: boolean;
}

export class FileTransferManager {
  private static readonly CHUNK_SIZE = 512 * 1024; // 512KB chunks for better performance

  static async processFileForTransfer(file: File): Promise<{
    metadata: FileMetadata;
    chunks: FileChunk[];
  }> {
    const fileId = crypto.randomUUID();
    const chunkCount = Math.ceil(file.size / this.CHUNK_SIZE);
    
    const metadata: FileMetadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      id: fileId,
      chunkCount,
      chunkSize: this.CHUNK_SIZE,
    };

    const chunks: FileChunk[] = [];
    
    for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
      const start = chunkIndex * this.CHUNK_SIZE;
      const end = Math.min(start + this.CHUNK_SIZE, file.size);
      const chunkBlob = file.slice(start, end);
      const chunkData = await chunkBlob.arrayBuffer();
      
      chunks.push({
        fileId,
        chunkIndex,
        data: chunkData,
        isLastChunk: chunkIndex === chunkCount - 1,
      });
    }

    return { metadata, chunks };
  }

  static processTextForTransfer(text: string): {
    metadata: FileMetadata;
    chunks: FileChunk[];
  } {
    const fileId = crypto.randomUUID();
    const encoder = new TextEncoder();
    const textData = encoder.encode(text);
    const chunkCount = Math.ceil(textData.length / this.CHUNK_SIZE);
    
    const metadata: FileMetadata = {
      name: `Text message.txt`,
      size: textData.length,
      type: 'text/plain',
      id: fileId,
      chunkCount,
      chunkSize: this.CHUNK_SIZE,
    };

    const chunks: FileChunk[] = [];
    
    for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
      const start = chunkIndex * this.CHUNK_SIZE;
      const end = Math.min(start + this.CHUNK_SIZE, textData.length);
      const chunkData = textData.slice(start, end).buffer;
      
      chunks.push({
        fileId,
        chunkIndex,
        data: chunkData,
        isLastChunk: chunkIndex === chunkCount - 1,
      });
    }

    return { metadata, chunks };
  }

  static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Create binary message with embedded metadata
  static createBinaryChunkMessage(chunk: FileChunk): ArrayBuffer {
    // Create metadata header (64 bytes to fit full UUID)
    const header = new ArrayBuffer(64);
    const headerView = new DataView(header);
    
    // Write chunk metadata to header
    headerView.setUint32(0, chunk.chunkIndex, true); // chunk index (4 bytes)
    headerView.setUint32(4, chunk.data.byteLength, true); // chunk size (4 bytes)
    headerView.setUint8(8, chunk.isLastChunk ? 1 : 0); // is last chunk flag (1 byte)
    // 55 bytes reserved, with 36 for fileId
    
    // Write full fileId as bytes (UUIDs are 36 characters)
    const encoder = new TextEncoder();
    const fileIdBytes = encoder.encode(chunk.fileId); // Full UUID
    new Uint8Array(header, 9, Math.min(fileIdBytes.length, 36)).set(fileIdBytes.slice(0, 36));
    
    // Combine header + chunk data
    const combined = new ArrayBuffer(header.byteLength + chunk.data.byteLength);
    const combinedView = new Uint8Array(combined);
    
    combinedView.set(new Uint8Array(header), 0);
    combinedView.set(new Uint8Array(chunk.data), header.byteLength);
    
    return combined;
  }

  // Parse binary message to extract metadata and data
  static parseBinaryChunkMessage(buffer: ArrayBuffer): {
    fileId: string;
    chunkIndex: number;
    chunkSize: number;
    isLastChunk: boolean;
    data: ArrayBuffer;
  } {
    if (buffer.byteLength < 64) {
      throw new Error('Buffer too small for binary chunk header');
    }
    
    const headerView = new DataView(buffer, 0, 64);
    const chunkIndex = headerView.getUint32(0, true);
    const chunkSize = headerView.getUint32(4, true);
    const isLastChunk = headerView.getUint8(8) === 1;
    
    // Extract fileId (now 36 bytes for full UUID)
    const decoder = new TextDecoder();
    const fileIdBytes = new Uint8Array(buffer, 9, 36);
    const fileId = decoder.decode(fileIdBytes).replace(/\0/g, ''); // Remove null bytes
    
    // Extract chunk data (after 64-byte header)
    const data = buffer.slice(64);
    
    return {
      fileId,
      chunkIndex,
      chunkSize,
      isLastChunk,
      data
    };
  }
}

export interface FileTransferProgress {
  fileId: string;
  fileName: string;
  totalChunks: number;
  sentChunks: number;
  progress: number; // 0-100
}

export interface FileReceptionProgress {
  fileId: string;
  fileName: string;
  fileSize: number;
  senderName: string;
  totalChunks: number;
  receivedChunks: number;
  progress: number; // 0-100
  isComplete: boolean;
  startTime: number;
}

export interface TextReceptionProgress {
  textId: string;
  content: string;
  senderName: string;
  timestamp: number;
  type: 'text' | 'link';
}

export class FileReceiver {
  private receivedChunks: Map<string, Map<number, ArrayBuffer>> = new Map();
  private fileMetadata: Map<string, FileMetadata> = new Map();
  private fileWriters: Map<string, WritableStreamDefaultWriter> = new Map();
  private fileStreams: Map<string, WritableStream> = new Map();
  private receptionProgress: Map<string, FileReceptionProgress> = new Map();
  private textReceptions: Map<string, TextReceptionProgress> = new Map(); // textId -> TextReceptionProgress
  private senderNames: Map<string, string> = new Map(); // fileId -> senderName

  receiveMetadata(metadata: FileMetadata, senderName: string): void {
    this.fileMetadata.set(metadata.id, metadata);
    this.receivedChunks.set(metadata.id, new Map());
    this.senderNames.set(metadata.id, senderName);
    
    // Initialize reception progress
    const progress = {
      fileId: metadata.id,
      fileName: metadata.name,
      fileSize: metadata.size,
      senderName,
      totalChunks: metadata.chunkCount,
      receivedChunks: 0,
      progress: 0,
      isComplete: false,
      startTime: Date.now()
    };
    this.receptionProgress.set(metadata.id, progress);

    // Create a writable stream for progressive writing
    this.initializeFileStream(metadata.id);
  }

  private initializeFileStream(fileId: string): void {
    const chunks: ArrayBuffer[] = [];
    
    const stream = new WritableStream({
      write(chunk: ArrayBuffer) {
        chunks.push(chunk);
      },
      close() {
        // Stream closed
      }
    });

    const writer = stream.getWriter();
    this.fileStreams.set(fileId, stream);
    this.fileWriters.set(fileId, writer);
    
    // Store chunks array for later assembly
    this.receivedChunks.set(fileId, new Map());
  }

  async receiveChunk(fileId: string, chunkIndex: number, data: ArrayBuffer, senderName?: string): Promise<boolean> {
    const chunks = this.receivedChunks.get(fileId);
    const metadata = this.fileMetadata.get(fileId);
    const writer = this.fileWriters.get(fileId);
    const progress = this.receptionProgress.get(fileId);
    
    if (!chunks || !metadata || !writer || !progress) {
      return false;
    }

    // Store the chunk
    chunks.set(chunkIndex, data);
    
    // Write chunk to stream (progressive writing)
    try {
      await writer.write(data);
    } catch (error) {
      console.error('Error writing chunk to stream:', error);
    }

    // Update progress
    const newProgress = (chunks.size / metadata.chunkCount) * 100;
    const updatedProgress: FileReceptionProgress = {
      ...progress,
      receivedChunks: chunks.size,
      progress: newProgress
    };
    
    this.receptionProgress.set(fileId, updatedProgress);
    
    // Check if all chunks received
    const isComplete = chunks.size === metadata.chunkCount;
    if (isComplete) {
      await writer.close();
      updatedProgress.isComplete = true;
      this.receptionProgress.set(fileId, updatedProgress);
    }
    
    return isComplete;
  }

  getReceptionProgress(fileId: string): FileReceptionProgress | null {
    return this.receptionProgress.get(fileId) || null;
  }

  getAllReceptionProgress(): FileReceptionProgress[] {
    // Create fresh objects to ensure React re-renders
    return Array.from(this.receptionProgress.values()).map(p => ({...p}));
  }

  assembleFile(fileId: string): Blob | null {
    const chunks = this.receivedChunks.get(fileId);
    const metadata = this.fileMetadata.get(fileId);
    
    if (!chunks || !metadata || chunks.size !== metadata.chunkCount) {
      return null;
    }

    const assembledData = new Uint8Array(metadata.size);
    let offset = 0;

    for (let i = 0; i < metadata.chunkCount; i++) {
      const chunkData = chunks.get(i);
      if (!chunkData) {
        console.error('Missing chunk:', i);
        return null;
      }
      
      const chunkBytes = new Uint8Array(chunkData);
      assembledData.set(chunkBytes, offset);
      offset += chunkBytes.length;
    }

    return new Blob([assembledData], { type: metadata.type });
  }

  downloadFile(fileId: string): void {
    const blob = this.assembleFile(fileId);
    const metadata = this.fileMetadata.get(fileId);
    
    if (!blob || !metadata) {
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = metadata.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  cleanup(fileId: string): void {
    // Close and cleanup streams
    const writer = this.fileWriters.get(fileId);
    if (writer) {
      writer.close().catch(console.error);
      this.fileWriters.delete(fileId);
    }
    
    this.fileStreams.delete(fileId);
    this.receivedChunks.delete(fileId);
    this.fileMetadata.delete(fileId);
    this.receptionProgress.delete(fileId);
    this.senderNames.delete(fileId);
  }

  dismissReception(fileId: string): void {
    this.receptionProgress.delete(fileId);
  }

  receiveText(content: string, senderName: string): string {
    const textId = crypto.randomUUID();
    const isLink = this.isValidUrl(content);
    
    const textReception: TextReceptionProgress = {
      textId,
      content,
      senderName,
      timestamp: Date.now(),
      type: isLink ? 'link' : 'text'
    };
    
    this.textReceptions.set(textId, textReception);
    return textId;
  }

  private isValidUrl(text: string): boolean {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  }

  getAllTextReceptions(): TextReceptionProgress[] {
    return Array.from(this.textReceptions.values()).map(t => ({...t}));
  }

  dismissTextReception(textId: string): void {
    this.textReceptions.delete(textId);
  }

  copyTextToClipboard(textId: string): void {
    const textReception = this.textReceptions.get(textId);
    if (textReception) {
      navigator.clipboard.writeText(textReception.content);
    }
  }

  copyFileTextToClipboard(fileId: string): void {
    // Get the assembled file text and copy to clipboard
    const blob = this.assembleFile(fileId);
    const metadata = this.fileMetadata.get(fileId);
    
    if (blob && metadata && metadata.type === 'text/plain') {
      // Convert blob to text and copy to clipboard
      blob.text().then(text => {
        navigator.clipboard.writeText(text);
      }).catch(error => {
        console.error('Failed to copy text:', error);
      });
    }
  }
}