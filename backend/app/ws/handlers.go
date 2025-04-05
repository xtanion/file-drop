package ws

import (
	"encoding/json"
	"log"
)

type EventHandler func(manager *RoomManager, conn *Connection, data json.RawMessage)

var Handlers = map[string]EventHandler{
	"join-room":    handleJoinRoom,
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
	manager.Join(payload.RoomID, conn)
	log.Println("User joined room:", payload.RoomID)
}

func handleFileMeta(manager *RoomManager, conn *Connection, data json.RawMessage) {
	var payload FileMetaPayload
	if err := json.Unmarshal(data, &payload); err != nil {
		log.Println("Invalid file-meta payload:", err)
		return
	}
	manager.Broadcast(conn.RoomID, map[string]interface{}{
		"data":  payload.Metadata,
	}, conn)
}

func handleFileChunk(manager *RoomManager, conn *Connection, data json.RawMessage) {
	var payload FileChunkPayload
	if err := json.Unmarshal(data, &payload); err != nil {
		log.Println("Invalid file chunk:", err)
		return
	}
	manager.Broadcast(conn.RoomID, map[string]interface{}{
		"data":  payload.Chunk,
	}, conn)
}

func handleFileStatus(manager *RoomManager, conn *Connection, data json.RawMessage) {
	var payload FileStatusPayload
	if err := json.Unmarshal(data, &payload); err != nil {
		log.Println("Invalid file status:", err)
		return
	}
	manager.Broadcast(conn.RoomID, map[string]interface{}{
		"data":  payload.Progress,
	}, conn)
}
