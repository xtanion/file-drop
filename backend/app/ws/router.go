package ws

import (
	"encoding/json"
	"log"
	"net/http"
	
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
	EnableCompression: true,
}

type EventMessage struct {
	Event string          `json:"event"`
	Data  json.RawMessage `json:"data"`
}

func ServeWS(manager *RoomManager, w http.ResponseWriter, r *http.Request) {
	log.Println("Incoming WebSocket request from:", r.RemoteAddr)
	socket, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade failed:", err)
		return
	}
	log.Println("WebSocket connection established")

	conn := NewConnection(socket, manager)

	defer func() {
		log.Printf("WebSocket connection closed for user: %s", conn.Username)
		conn.Close()	
	}()

	for {
		messageType, data, err := socket.ReadMessage()
		if err != nil {
			log.Println("read error:", err)
			break
		}

		switch messageType {
		case websocket.TextMessage:
			log.Printf("Received text message: %s", string(data))

			var msg EventMessage
			if err := json.Unmarshal(data, &msg); err != nil {
				log.Println("JSON unmarshal error:", err)
				log.Printf("Raw data that failed to unmarshal: %s", string(data))
				continue
			}
			log.Printf("Received event: %s", msg.Event)
			log.Printf("Data: %s", msg.Data)
			if handler, ok := Handlers[msg.Event]; ok {
				log.Printf("Found handler for event: %s", msg.Event)
				handler(manager, conn, msg.Data)
			} else {
				log.Println("No handler for event:", msg.Event)
			}

		case websocket.BinaryMessage:
			if len(data) > 2<<20 { // max chunk size = 2MB
				log.Println("Binary message too large, dropping")
				continue
			}
			log.Printf("Received Binary Message: %d bytes", len(data))
			if conn.RoomID != "" {
				handleBinaryFileChunk(manager, conn, data)
			}

		default:
			log.Println("Unsupported message type:", messageType)
		}
	}
}
