import React, { useCallback, useEffect, useState } from "react";
import io from "socket.io-client";
import './style.css'

const RandomRoom =() => {
    return (Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000).toString();
}

const CreateRoom = (props) => {
    const { getRoom, room} = props;
    const [roomCode, setRoomCode] = useState('')

    useEffect(() => {
        if (room != '') {
            setRoomCode(room.toString());
            console.log("default room created");
        } else {
            var r = RandomRoom();
            setRoomCode(r);
        }
    }, [room]);

    const handleChange = (e) => {
        setRoomCode(e.target.value)
    }

    const buttonHandle = () => {
        console.log('Button Clicked')
        getRoom(roomCode.toString());
    }

    return (
        <div className="join-screen">

            <div className="join-code">
                <h2 className="join-name">Your Room Code: {roomCode}</h2>
                <p className="join-p">Refresh the page to get a new code</p>
            </div>

            <div className="join-input">
                <div className="container">
                    <input type="text" placeholder={roomCode} className="join-ipt" onChange={handleChange} autoFocus/>
                    <button className="join-btn" onClick={buttonHandle}>Join Room</button>
                </div>
            </div>

        </div>
    );
}

export default CreateRoom;