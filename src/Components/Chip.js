import React, { useState} from "react";
import './style.css'

const Chip = props => {
    const { roomId } = props;
    return (
        <div className="chip">
            <p>{roomId}</p>
        </div>

    )
}
export default Chip;