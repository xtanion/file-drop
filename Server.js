const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require('fs');


app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("join-room", (data) => {
        socket.join(data);
    });

    socket.on("file-meta", function (data) {
        socket.to(data.uid).emit("rs-meta", data.metadata);
    });

    socket.on("file-send", function (data) {
        socket.to(data.uid).emit("file-receive", data.buffer);
    });
});

server.listen(5000, () => {
    console.log("SERVER IS RUNNING");
});