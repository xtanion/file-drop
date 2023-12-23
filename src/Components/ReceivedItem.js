import React from "react";
import { CircularProgressbar } from 'react-circular-progressbar';
// import 'react-circular-progressbar/dist/styles.css';
import './style.css'


const ReceivedItem = props => {
    const { name, percentage } = props;
    return (
        <div className="rsi-container">
            {percentage < 100 ? <div className="progressbar"> <CircularProgressbar value={percentage} text={`${percentage}%`} strokeWidth={4} /> </div>
                :
                <div className="download-file">
                    <p className="download-p">File Received | Click to download</p>
                    <img width={45} src="/download.svg" />
                </div>}
            <p className="file-text">{name}</p>
        </div>

    )
}
export default ReceivedItem;