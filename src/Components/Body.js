import { Card } from "@mui/joy";
import React, { useEffect, useState, useRef } from "react";
import Send from "./Send";
import Receive from "./Receive";

import io from "socket.io-client";
import CreateRoom from "./CreateRoom";

import './style.css'

const Body = props => {
    // const { socket } = props;

    const socketRef = useRef(null);

    useEffect(() => {
        socketRef.current = io.connect("http://localhost:5000");
        console.log('Socket Started')
        
        return () => {
            socketRef.current.disconnect();
        }
    }, []);
    const [room, setRoom] = useState('');
    const [joined, setJoined] = useState(false);
    const getRoom = (room) => {
        // console.log('Joining Room: ', room);
        setRoom(room);
        joinRoom(room);
    }
    const joinRoom = (room) => {
        if (room !== "" && socketRef) {
            console.log(socketRef.current);
            socketRef.current.emit("join-room", room);
            console.log("Joined room: ", room);
            setJoined(true);
        }
    };
    //-------------------
    
    return (
        <div className="centered-div">
            {joined ?
                <div className="join-screen">
                    <h2 className="join-name">You have Joined: {room}</h2>
                    <p className="join-p">refresh page to establish a new connection</p>
                </div>
                :
                <CreateRoom getRoom={getRoom}></CreateRoom>
            }
            <Send room={room} socket={socketRef.current}></Send>
            <Receive room={room} socket={socketRef.current}></Receive>
        </div>
    )
};

export default Body;