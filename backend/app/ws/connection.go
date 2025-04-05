package ws

import (
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

type Connection struct {
	Socket  *websocket.Conn
	SendCh  chan interface{}
	RoomID  string
	manager *RoomManager
	mu      sync.Mutex
}

func NewConnection(socket *websocket.Conn, manager *RoomManager) *Connection {
	conn := &Connection{
		Socket:  socket,
		SendCh:  make(chan interface{}, 256),
		manager: manager,
	}
	go conn.writePump()
	return conn
}

func (c *Connection) Send(msg interface{}) {
	select {
	case c.SendCh <- msg:
	default:
		log.Println("Send channel full, closing connection")
		c.Close()
	}
}

func (c *Connection) Close() {
	c.Socket.Close()
	close(c.SendCh)
	c.manager.Leave(c)
}

func (c *Connection) writePump() {
	for msg := range c.SendCh {
		if err := c.Socket.WriteJSON(msg); err != nil {
			log.Println("Write error:", err)
			c.Close()
			break
		}
	}
}
