package main

import (
	"log"
	"net/http"
	"os"
	"file-drop/app/ws"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	port := os.Getenv("BACKEND_PORT")
	if port == "" {
		port = "6969"
	}

	r := gin.Default()
	manager := ws.NewRoomManager()

	r.GET("/ws", func(c *gin.Context) {
		ws.ServeWS(manager, c.Writer, c.Request)
	})

	log.Printf("Server started on :%s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
    	log.Fatalf("server exited with error: %v", err)
	}
}
