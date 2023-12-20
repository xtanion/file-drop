import { Card } from "@mui/joy";
import React, { useCallback, useState, useEffect } from "react";
import './style.css'

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
    const { room, socket } = props;
    useEffect(() => {
        
        // const [meta, setMeta] = useState(null);

        console.log('Receive Room: ', room, socket, meta);
        if (!room || !socket) return;

        let filedata = {};
        let counter = 0;

        socket.on("rs-meta", data => {
            setMeta(data);
            // do something about useState for metadata
            filedata.metadata = data;
            filedata.transmitted = 0;
            filedata.buffer = new Array();
            console.log("Received MetaData: ", data);
        })

        socket.on("file-receive", data => {
            counter += 1;
            console.log("Received Buffer: ", filedata, counter);
            filedata.buffer.push(data);
            filedata.transmitted += data.byteLength;
            
            if (filedata.transmitted == filedata.metadata.total_buffer_size) {
                console.log('Donloadable file:', filedata);
                const resfile = new Blob(filedata.buffer);
                downloadFile(resfile, filedata.metadata.filename);
                filedata = {};
                counter = 0;
            } else {
                socket.emit("fs-start", room);
            }
        }, [room, socket])
    });

    return (
        <div className="rs-screen">
            {/* (meta!=null ? <div><p>{meta.filename}</p></div> : <div> </div>) */}
        </div>
    )
}
export default Receive;