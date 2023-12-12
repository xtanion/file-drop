import { Card } from "@mui/joy";
import React from "react";
import Send from "./Send";
import Receive from "./Receive";

import io from "socket.io-client";

const Body = props => {
    // const { socket } = props;
    const socket = io.connect("http://localhost:5000");
    // move to CreateRoom
    let room = 565;
    const joinRoom = () => {
        if (room !== "") {
            socket.emit("join-room", room);
            console.log("Joined room: ", room);
        }
    };
    //-------------------
    
    return (
        <div>
            <button onClick={joinRoom}>Join Room</button>
            <Send room={room} socket={socket}></Send>
            <Receive room={room} socket={socket}></Receive>
        </div>
    )
};

export default Body;