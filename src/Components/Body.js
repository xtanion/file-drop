import { Card } from "@mui/joy";
import React, { useEffect, useState, useRef } from "react";
import Send from "./Send";
import Receive from "./Receive";

import io from "socket.io-client";
import CreateRoom from "./CreateRoom";

import './style.css'
import Nearby from "./Nearby";

const RandomRoom = () => {
    return (Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000).toString();
}


const Body = props => {
    // const { socket } = props;

    const socketRef = useRef(null);

    const [room, setRoom] = useState('');
    const [joined, setJoined] = useState(false);
    const [nearby, setNearby] = useState([]);
    const getRoom = (room) => {
        setRoom(room);
        joinRoom(room);
    }
    const joinRoom = (room) => {
        if (room !== "" && socketRef.current) {
            console.log(socketRef.current);
            socketRef.current.emit("join-room", room);
            console.log("Joined room: ", room);

            console.log('braodcasting: ', room);
            
            setJoined(true);
        }
    };

    useEffect(() => {
        socketRef.current = io.connect("http://localhost:5000");

        if (room == '') {
            var r = RandomRoom();
            setRoom(r);
            socketRef.current.emit("broadcast-room", r);
        }
        console.log('Socket Started', socketRef.current)
        socketRef.current.on('broadcast', data => {
            console.log('body: ', data);
            setNearby([...nearby, data]);
        })
        return () => {
            socketRef.current.disconnect();
        }
    }, []);
    //-------------------
    
    return (
        <div className="centered-div">
            {joined ?
                <div className="join-screen">
                    <h2 className="join-name">You have Joined: {room}</h2>
                    <p className="join-p">refresh page to establish a new connection</p>
                </div>
                :
                <CreateRoom getRoom={getRoom} room={room}></CreateRoom>
            }
            <Nearby nearby={nearby} socket={socketRef.current}></Nearby>
            <Send room={room} socket={socketRef.current}></Send>
            <Receive room={room} socket={socketRef.current}></Receive>
        </div>
    )
};

export default Body;