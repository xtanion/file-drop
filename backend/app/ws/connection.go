package ws

import (
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

var (
	chunkBufferPool = sync.Pool{
		New: func() interface{} {
			return make([]byte, 512*1024)
		},
	}
	
	messageBufferPool = sync.Pool{
		New: func() interface{} {
			return make([]byte, 4*1024)
		},
	}
)

type Connection struct {
	Socket   *websocket.Conn
	SendCh   chan interface{}
	RoomID   string // can be roomid, or userid
	Username string
	manager  *RoomManager
	mu       sync.Mutex
	closed   bool
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
	c.mu.Lock()
	defer c.mu.Unlock()
	
	if c.closed {
		log.Printf("Cannot send message to closed connection for user %s", c.Username)
		return
	}
	
	log.Printf("Connection.Send called for user %s with message: %+v", c.Username, msg)
	select {
	case c.SendCh <- msg:
		log.Printf("Message queued for user %s", c.Username)
	default:
		log.Println("Send channel full, closing connection")
		c.closeUnsafe()
	}
}

func (c *Connection) Close() {
	c.mu.Lock()
	shouldLeave := !c.closed
	c.closeUnsafe()
	c.mu.Unlock()
	
	if shouldLeave {
		c.manager.Leave(c)
	}
}

func (c *Connection) closeUnsafe() {
	if c.closed {
		return
	}
	c.closed = true
	c.Socket.Close()
	close(c.SendCh)
}

func (c *Connection) writePump() {
	defer func() {
		log.Printf("writePump ended for user %s", c.Username)
	}()
	
	for msg := range c.SendCh {
		log.Printf("writePump: Sending JSON message to %s: %+v", c.Username, msg)
		if err := c.Socket.WriteJSON(msg); err != nil {
			log.Printf("Write error for user %s: %v", c.Username, err)
			c.Close()
			return
		} else {
			log.Printf("Successfully wrote JSON message to %s", c.Username)
		}
	}
}
