package ws

import (
	"encoding/json"
	"log"
	"net/http"
	
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type EventMessage struct {
	Event string          `json:"event"`
	Data  json.RawMessage `json:"data"`
}

func ServeWS(manager *RoomManager, w http.ResponseWriter, r *http.Request) {
	socket, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade failed:", err)
		return
	}
	log.Println("WebSocket connection established")

	conn := NewConnection(socket, manager)

	for {
		messageType, data, err := socket.ReadMessage()
		if err != nil {
			log.Println("read error:", err)
			conn.Close()
			break
		}

		switch messageType {
		case websocket.TextMessage:

			var msg EventMessage
			if err := json.Unmarshal(data, &msg); err != nil {
				log.Println("JSON unmarshal error:", err)
				continue
			}
			log.Printf("Received event: %s", msg.Event)
			log.Printf("Data: %s", msg.Data)
			if handler, ok := Handlers[msg.Event]; ok {
				handler(manager, conn, msg.Data)
			} else {
				log.Println("No handler for event:", msg.Event)
			}

		case websocket.BinaryMessage:
			if len(data) > 2<<20 { // max chunk size allowed = 2MB
				log.Println("Binary message too large, dropping")
				continue
			}
			log.Printf("Received Binary Message: %d bytes", len(data))
			if conn.RoomID != "" {
				Handlers["file-chunk"](manager, conn, data)
			}

		default:
			log.Println("Unsupported message type:", messageType)
		}
	}
}
