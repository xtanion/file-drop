import { Card } from "@mui/joy";
import React, { useCallback, useState, useEffect } from "react";
import './style.css'
import ReceivedItem from "./ReceivedItem";

const downloadFile = (blob, fileName) => {
    const link = document.createElement('a');
    // create a blobURI pointing to our Blob
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    // some browser needs the anchor to be in the doc
    document.body.append(link);
    link.click();
    link.remove();
    // in case the Blob uses a lot of memory
    setTimeout(() => URL.revokeObjectURL(link.href), 7000);
};


const Receive = props => {
    const [meta, setMeta] = useState(null);
    const [progress, setProgress] = useState(0);
    const [fileBlob, setFileBlob] = useState(null);
    const { room, socket } = props;
    useEffect(() => {
        if (!room || !socket) return;

        let filedata = {};

        socket.on("rs-meta", data => {
            setMeta(data);
            // do something about useState for metadata
            filedata.metadata = data;
            filedata.transmitted = 0;
            // filedata.buffer = new Array();
            filedata.blob = new Blob();
            console.log("Meta: ", data);
        })

        // todo: send files in multiple of 2^x

        socket.on("file-receive", data => {
            // filedata.buffer.push(data);
            filedata.blob = new Blob([filedata.blob, data]);
            filedata.transmitted += data.byteLength;
            setProgress(Math.floor(filedata.transmitted / filedata.metadata.total_buffer_size * 100));
            
            if (filedata.transmitted == filedata.metadata.total_buffer_size) {
                console.log('Donloadable file:', filedata);
                // const resfile = new Blob(filedata.buffer);
                // setFileBlob(new Blob(filedata.buffer));
                setFileBlob(filedata.blob);
                console.log(filedata.blob);
                // downloadFile(resfile, filedata.metadata.filename);
                filedata = {};
            } else {
                socket.emit("fs-start", room);
            }
        })
    }, [room, socket]);

    const downloadHandle = () => {
        if (fileBlob != null) {
            downloadFile(fileBlob, meta.filename);
            setFileBlob(null);
            setMeta(null);
        }
    }
    return (
        <div className="rs-screen" onClick={downloadHandle}>
            <h2 className="js-name">Received Items</h2>
            {meta != null ? <ReceivedItem name={meta.filename} percentage={progress}></ReceivedItem> : <div> </div> }
        </div>
    )
}
export default Receive;