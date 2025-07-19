package ws

import (
	"log"
	"sync"
	
	"github.com/gorilla/websocket"
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

// func (rm *RoomManager) GetRoom(roomID string) map[string]bool {
// 	// rm.mu.RLock()
// 	// defer rm.mu.RUnlock()
// 	// return all usernames
// 	if data, ok := rm.rooms[roomID]; ok {
// 		return data
// 	}
// 	return []
// }

func (rm *RoomManager) Join(roomID string, conn *Connection) {
	// Prepare data structures before locking
	var existingUsers []string
	var userJoinedMessage map[string]interface{}
	var roomUsersMessage map[string]interface{}
	var welcomeMessage map[string]interface{}
	var shouldBroadcastUserJoined bool
	
	rm.mu.Lock()
	
	if conns, ok := rm.rooms[conn.RoomID]; ok {
		delete(conns, conn)
		log.Printf("User %s left room: %s", conn.Username, conn.RoomID)
		if len(conns) == 0 {
			delete(rm.rooms, conn.RoomID)
		}
	}
	
	if existingConns, ok := rm.rooms[roomID]; ok {
		for c := range existingConns {
			if c.Username != "" {
				existingUsers = append(existingUsers, c.Username)
			}
		}
	}
	
	log.Printf("User %s joining room %s. Existing users: %v", conn.Username, roomID, existingUsers)
	
	if len(existingUsers) >= 5 {
		log.Printf("Room %s is full (5/5 users). Rejecting user %s", roomID, conn.Username)
		rm.mu.Unlock()
		
		conn.Send(map[string]interface{}{
			"event":   "room-full",
			"room":    roomID,
			"message": "Room is full. Maximum 5 users allowed.",
			"current_users": len(existingUsers),
			"max_users": 5,
		})
		return
	}
	
	if _, ok := rm.rooms[roomID]; !ok {
		rm.rooms[roomID] = make(map[*Connection]bool)
	}
	
	if len(existingUsers) > 0 {
		shouldBroadcastUserJoined = true
		userJoinedMessage = map[string]interface{}{
			"event":    "user-joined",
			"username": conn.Username,
			"room":     roomID,
		}
	}
	
	rm.rooms[roomID][conn] = true
	conn.RoomID = roomID
	
	var allUsers []string
	for c := range rm.rooms[roomID] {
		if c.Username != "" {
			allUsers = append(allUsers, c.Username)
		}
	}
	
	log.Printf("Room %s now has users: %v", roomID, allUsers)
	
	roomUsersMessage = map[string]interface{}{
		"event": "room-users",
		"room":  roomID,
		"users": allUsers,
	}
	
	welcomeMessage = map[string]interface{}{
		"event":        "room-joined",
		"room":         roomID,
		"message":      "Successfully joined room",
		"users":        allUsers,
		"existingUsers": existingUsers,
	}
	rm.mu.Unlock()
	
	if shouldBroadcastUserJoined {
		log.Printf("Broadcasting user-joined event for %s to existing users: %v", conn.Username, existingUsers)
		rm.Broadcast(roomID, userJoinedMessage, conn)
	}
	
	log.Printf("Broadcasting room-users message: %+v", roomUsersMessage)
	rm.Broadcast(roomID, roomUsersMessage, nil)
	log.Printf("Broadcast completed for room-users message")
	
	log.Printf("Sending welcome message to %s", conn.Username)
	conn.Send(welcomeMessage)
}

func (rm *RoomManager) Leave(conn *Connection) {
	var userLeftMessage map[string]interface{}
	var roomUsersMessage map[string]interface{}
	var shouldBroadcast bool
	
	// Critical section with lock
	rm.mu.Lock()
	roomID := conn.RoomID
	username := conn.Username
	
	if conns, ok := rm.rooms[roomID]; ok {
		delete(conns, conn)
		log.Printf("User %s left room %s", username, roomID)
		
		if len(conns) == 0 {
			delete(rm.rooms, roomID)
			log.Printf("Room %s deleted - no users remaining", roomID)
		} else {
			var usernames []string
			for c := range conns {
				usernames = append(usernames, c.Username)
			}
			
			shouldBroadcast = true
			if username != "" {
				userLeftMessage = map[string]interface{}{
					"event":    "user-left",
					"username": username,
					"room":     roomID,
				}
			}
			
			roomUsersMessage = map[string]interface{}{
				"event": "room-users",
				"room":  roomID,
				"users": usernames,
			}
			
			log.Printf("Prepared broadcast for room %s about %s leaving. Remaining users: %v", roomID, username, usernames)
		}
	}
	
	rm.mu.Unlock()
	
	if shouldBroadcast {
		if userLeftMessage != nil {
			rm.Broadcast(roomID, userLeftMessage, nil)
		}
		rm.Broadcast(roomID, roomUsersMessage, nil)
		log.Printf("Broadcast completed for user %s leaving room %s", username, roomID)
	}
}

func (rm *RoomManager) Broadcast(roomID string, message interface{}, exclude *Connection) {
	rm.mu.RLock()
	defer rm.mu.RUnlock()
	
	connections, exists := rm.rooms[roomID]
	if !exists {
		log.Printf("Room %s does not exist for broadcast", roomID)
		return
	}
	
	connCount := 0
	sentCount := 0
	for conn := range connections {
		connCount++
		log.Printf("Broadcasting to connection %s (username: %s) in room %s", conn.RoomID, conn.Username, roomID)
		if conn != exclude {
			conn.Send(message)
			sentCount++
			log.Printf("Message sent to %s", conn.Username)
		} else {
			log.Printf("Skipping excluded connection %s", conn.Username)
		}
	}
	log.Printf("Total connections in room %s: %d, Messages sent: %d", roomID, connCount, sentCount)
}

func (rm *RoomManager) BroadcastBinary(roomID string, binaryData []byte, exclude *Connection) {
	rm.mu.RLock()
	defer rm.mu.RUnlock()
	
	connections, exists := rm.rooms[roomID]
	if !exists {
		log.Printf("Room %s does not exist for binary broadcast", roomID)
		return
	}
	
	connCount := 0
	sentCount := 0
	for conn := range connections {
		connCount++
		if conn != exclude {
			if err := conn.Socket.WriteMessage(websocket.BinaryMessage, binaryData); err != nil {
				log.Printf("Binary write error for user %s: %v", conn.Username, err)
			} else {
				sentCount++
			}
		}
	}
	log.Printf("Binary broadcast to room %s: %d connections, %d sent, %d bytes", roomID, connCount, sentCount, len(binaryData))
}
