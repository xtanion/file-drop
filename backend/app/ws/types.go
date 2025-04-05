package ws

type JoinRoomPayload struct {
	RoomID string `json:"roomId"`
}

type FileMetaPayload struct {
	Metadata interface{} `json:"metadata"`
}

type FileChunkPayload struct {
	Chunk interface{} `json:"chunk"`
}

type FileStatusPayload struct {
	Progress int `json:"progress"`
}
