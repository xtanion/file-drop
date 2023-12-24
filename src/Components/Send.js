import { Box, Card, CardContent } from "@mui/joy";
import React, { useCallback, useState } from "react";
import FileDrop from "./FileDrop";
import DragDropFiles from "./FileDrop";
import "./style.css"

const Send = props => {
    const { room, socket } = props;
    const roomText = "Room: #" + room;
    const [file, setFile] = useState();
    const [status, setStatus] = useState('Send');

    const changeFile = (filename) => {
        setFile(filename);
    }

    // const onFileChange = useCallback(files => setFile(files[0]), []);
    const divideChunk = (number) => {
        if (number <= 0) {
            return 0;
        }

        let msbPosition = 0;
        while (number > 1) {
            number >>= 1;
            msbPosition++;
        }

        const nearestPower = 1 << msbPosition;
        return nearestPower;
    }
    const sendFile = () => {
        console.log('Sending file to Room: ', room);
        setStatus('Sending');
        if (file && socket) {
            console.log('file: ',file);
            let reader = new FileReader();
            reader.onload = (a) => {
                let buffer = new Uint8Array(reader.result);
                // todo: send chunks in multiple of 2^x
                let npw = divideChunk(buffer.length/100);
                let bs = Math.max(npw, 1024);
                const metadata = {
                    filename: file.name,
                    total_buffer_size: buffer.length,
                    buffer_size: bs
                }
                handleShare(metadata, buffer);  // sharing file
            }
            reader.readAsArrayBuffer(file);
        } else {
            // can be used for text/clipboard share;
            return;
        }
    }

    const handleShare = (metadata, buffer) => {
        socket.emit("file-meta", {
            uid: room,
            metadata: metadata
        });


        console.log("file size:", metadata.total_buffer_size);
        console.log('Room: ', room);
        let chunk = buffer.slice(0, metadata.buffer_size);
        while (chunk.length !== 0) {
            console.log("chunk.length: ", chunk.length);
            buffer = buffer.slice(metadata.buffer_size, buffer.length);
            socket.emit("file-send", {
                uid: room,
                buffer: chunk
            });
            socket.emit("file-send-progress", {
                uid: room,
                // percentage: percentage
            });
            chunk = buffer.slice(0, metadata.buffer_size);
        };
        // setFile(null);
        setStatus('Sent');
        console.log("-- Sent File Successfully")

    }

    const resetFile = () => {
        setFile(null);
        setStatus('Send');
    }

    return (
        <div className="fs-screen">
            {file ? (
                <div >
                    <div className="uploads">
                        <div className="file-container" onClick={resetFile}>
                            <img className="file-icon" src="/file.svg" alt="file-logo" />
                            <p className="file-text">{file.name}</p>
                            <img className="refresh-icon" src="/refresh.svg" alt="refresh-file"/>
                        </div>
                    </div>
                    <button className="fs-btn" onClick={sendFile}>{status}</button>
                </div>
            ) : (<DragDropFiles changeFile={changeFile}></DragDropFiles>)}
        </div>
    );
}

export default Send;