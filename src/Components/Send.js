import { Card, CardContent } from "@mui/joy";
import React, { useCallback, useState } from "react";

const Send = props => {
    const { room, socket } = props;
    const roomText = "Room: #" + room;
    const [file, setFile] = useState({});

    const onFileChange = useCallback(files => setFile(files[0]), []);
    const sendFile = () => {
        if (file) {
            let reader = new FileReader();
            reader.onload = (a) => {
                let buffer = new Uint8Array(reader.result);
                let bs = Math.max(buffer.length / 100, 1024);
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
        let chunk = buffer.slice(0, metadata.buffer_size);
        while (chunk.length != 0) {
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
        console.log("-- Sent File Successfully")

    }

    return (
        <div>
            <div>
                <h2>Send File</h2>
                <p>| { roomText } |</p>
                <input placeholder="file" type="file" onChange={(e) => {
                    setFile(e.target.files[0]);
                }} />
                <button onClick={sendFile}>
                    Send
                </button>
            </div>
            
        </div>
        // <Card style={cardStyle}>
        //     <Card.Body>
        //         <Card.Title>{roomText}</Card.Title>
        //         <Card.Subtitle className="mb-2 text-muted font-italic">
        //             Click to add File.
        //         </Card.Subtitle>
        //         <hr />
        //         <div>
        //             {file && file.name ? (
        //                 <InputGroup className="mb-3">
        //                     <FormControl
        //                         placeholder={file.name}
        //                         aria-label={file.name}
        //                         aria-describedby="file"
        //                         disabled={true}
        //                     />
        //                     <InputGroup.Append>
        //                         <button
        //                             onClick={sendFile}
        //                             disabled={!canUploadFile}
        //                         >Send</button>
        //                     </InputGroup.Append>
        //                 </InputGroup>
        //             ) : null}
        //             {/* ıf the file is getting uploaded */}
        //             {uploadPercentage > 0 ? (
        //                 <DownloadProgressBar percentage={uploadPercentage} />
        //             ) : null}
        //             <Row>
        //                 <Col />

        //                 <Col style={colStyle}>
        //                     {canUploadFile ? (
        //                         <InputFiles onChange={onFileChange}>
        //                             <span style={plusStyle}>+</span>
        //                         </InputFiles>
        //                     ) : null}
        //                 </Col>
        //                 <Col />
        //             </Row>
        //         </div>
        //     </Card.Body>
        // </Card>
    );
}

export default Send;