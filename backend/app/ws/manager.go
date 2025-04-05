package ws

import (
	"log"
	"sync"
)

// move to redis later
type RoomManager struct {
	rooms map[string]map[*Connection]bool
	mu    sync.RWMutex
}

func NewRoomManager() *RoomManager {
	return &RoomManager{
		rooms: make(map[string]map[*Connection]bool),
	}
}

func (rm *RoomManager) Join(roomID string, conn *Connection) {
	rm.mu.Lock()
	defer rm.mu.Unlock()
	// Remove the connection from its current room if it exists
	if conns, ok := rm.rooms[conn.RoomID]; ok {
		delete(conns, conn)
		log.Printf("User left room: %s", conn.RoomID)
		if len(conns) == 0 {
			delete(rm.rooms, conn.RoomID)
		}
	}
	if _, ok := rm.rooms[roomID]; !ok {
		rm.rooms[roomID] = make(map[*Connection]bool)
	}
	rm.rooms[roomID][conn] = true
	conn.RoomID = roomID
}

func (rm *RoomManager) Leave(conn *Connection) {
	rm.mu.Lock()
	defer rm.mu.Unlock()
	if conns, ok := rm.rooms[conn.RoomID]; ok {
		delete(conns, conn)
		if len(conns) == 0 {
			delete(rm.rooms, conn.RoomID)
		}
	}
}

func (rm *RoomManager) Broadcast(roomID string, message interface{}, exclude *Connection) {
	rm.mu.RLock()
	defer rm.mu.RUnlock()
	for conn := range rm.rooms[roomID] {
		if conn != exclude {
			conn.Send(message)
		}
	}
}
