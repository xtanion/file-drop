package main

import (
	"log"
	"net/http"
	"file-drop/app/ws"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	manager := ws.NewRoomManager()

	r.GET("/ws", func(c *gin.Context) {
		ws.ServeWS(manager, c.Writer, c.Request)
	})

	log.Println("Server started on :6969")
	if err := http.ListenAndServe(":6969", r); err != nil {
    	log.Fatalf("server exited with error: %v", err)
	}
}
