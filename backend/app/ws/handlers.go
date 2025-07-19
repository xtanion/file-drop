package ws

import (
	"encoding/json"
	"log"
)

type EventHandler func(manager *RoomManager, conn *Connection, data json.RawMessage)
type BinaryEventHandler func(manager *RoomManager, conn *Connection, data []byte)

var Handlers = map[string]EventHandler{
	"test-connection": handleTestConnection,
	"join-room":    handleJoinRoom,
	"leave-room":   handleLeaveRoom,
	"file-meta":    handleFileMeta,
	"file-chunk":   handleFileChunk,
	"file-status":  handleFileStatus,
}

func handleJoinRoom(manager *RoomManager, conn *Connection, data json.RawMessage) {
	var payload JoinRoomPayload
	if err := json.Unmarshal(data, &payload); err != nil {
		log.Println("Invalid join-room payload:", err)
		return
	}
	
	conn.Username = payload.Username
	log.Printf("Processing join request for user %s to room %s", payload.Username, payload.RoomID)
	
	manager.Join(payload.RoomID, conn)
	
	log.Printf("User %s successfully joined room %s", payload.Username, payload.RoomID)
}

func handleLeaveRoom(manager *RoomManager, conn *Connection, data json.RawMessage) {
	var payload JoinRoomPayload
	if err := json.Unmarshal(data, &payload); err != nil {
		log.Println("Invalid leave-room payload:", err)
		return
	}
	
	log.Printf("User %s leaving room: %s", conn.Username, conn.RoomID)
	manager.Leave(conn)
}

func handleFileMeta(manager *RoomManager, conn *Connection, data json.RawMessage) {
	var payload FileMetaPayload
	if err := json.Unmarshal(data, &payload); err != nil {
		log.Println("Invalid file-meta payload:", err)
		return
	}
	manager.Broadcast(conn.RoomID, map[string]interface{}{
		"event": "file-meta",
		"data":  payload.Metadata,
		"senderName": conn.Username,
	}, conn)
}

func handleFileChunk(manager *RoomManager, conn *Connection, data json.RawMessage) {
	var payload FileChunkPayload
	if err := json.Unmarshal(data, &payload); err != nil {
		log.Println("Invalid file chunk:", err)
		return
	}
	manager.Broadcast(conn.RoomID, map[string]interface{}{
		"event": "file-chunk",
		"data":  payload.Chunk,
		"senderName": conn.Username,
	}, conn)
}

func handleFileStatus(manager *RoomManager, conn *Connection, data json.RawMessage) {
	var payload FileStatusPayload
	if err := json.Unmarshal(data, &payload); err != nil {
		log.Println("Invalid file status:", err)
		return
	}
	manager.Broadcast(conn.RoomID, map[string]interface{}{
		"event": "file-status",
		"data":  payload.Progress,
		"senderName": conn.Username,
	}, conn)
}

func handleTestConnection(manager *RoomManager, conn *Connection, data json.RawMessage) {
	log.Println("Test connection received")
	conn.Send(map[string]interface{}{
		"event":   "test-success",
		"message": "Connection successful",
	})
}


func handleBinaryFileChunk(manager *RoomManager, conn *Connection, data []byte) {
	log.Printf("Received binary file chunk: %d bytes", len(data))
	
	buffer := chunkBufferPool.Get().([]byte)
	defer chunkBufferPool.Put(buffer)
	
	if len(data) < 64 {
		log.Println("Binary chunk too small, missing header")
		return
	}
	
	chunkIndex := uint32(data[0]) | uint32(data[1])<<8 | uint32(data[2])<<16 | uint32(data[3])<<24
	chunkSize := uint32(data[4]) | uint32(data[5])<<8 | uint32(data[6])<<16 | uint32(data[7])<<24
	isLastChunk := data[8] == 1
	
	fileIdBytes := data[9:45]
	fileIdEnd := 36
	for i, b := range fileIdBytes {
		if b == 0 {
			fileIdEnd = i
			break
		}
	}
	fileId := string(fileIdBytes[:fileIdEnd])
	
	chunkData := data[64:]
	
	log.Printf("Parsed chunk: fileId=%s, index=%d, size=%d, isLast=%t, actualSize=%d", 
		fileId, chunkIndex, chunkSize, isLastChunk, len(chunkData))
	
	manager.BroadcastBinary(conn.RoomID, data, conn)
}
