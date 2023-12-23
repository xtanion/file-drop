import { Card } from "@mui/joy";
import React, { useCallback, useState, useEffect } from "react";
import Chip from "./Chip";
import './style.css'

const Nearby = props => {
    const [nearbyArr, setNearby] = useState([])
    const { nearby, socket, connectNearby } = props;
    useEffect(() => {
        if (!socket) return;
        // setNearby([...nearbyArr, nearby]);
        setNearby(nearby);
        console.log(nearbyArr);

    }, [socket, nearby]);

    const handleChipClick = () => {
        connectNearby();
    }

    return (
        <div className="js-screen">
            <h3 className="js-name">Nearby Rooms</h3>
            <ul>{nearbyArr.length > 0 && nearbyArr.map((item, i) => <li key={i} onClick={handleChipClick}><Chip roomId={item}></Chip></li>)}</ul>
        </div>
    )
}
export default Nearby;