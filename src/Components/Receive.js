import { Card } from "@mui/joy";
import React, { useCallback, useState, useEffect } from "react";

const Receive = props => {
    const { room, socket } = props;

    useEffect(() => {
        if (!room || !socket) return;

        socket.on("rs-meta", data => {
            console.log("Received MetaData: ",data);
        })

        socket.on("file-receive", data => {
            console.log("Received Buffer: ", data);
        })
    });

    return (
        <Card>

        </Card>
        // <Card style={cardStyle}>
        //     <Card.Body>
        //         <Card.Title>{lobbyNumberText}</Card.Title>
        //         <Card.Subtitle className="mb-2 text-muted font-italic">
        //             Please wait until the file is fully uploaded
        //         </Card.Subtitle>
        //         <hr />
        //         <div>
        //             {currentFileInformation ? (
        //                 <InputGroup className="mb-3">
        //                     <FormControl
        //                         placeholder={currentFileInformation.fileName}
        //                         aria-label={currentFileInformation.fileName}
        //                         aria-describedby="file"
        //                         disabled={true}
        //                     />
        //                     <InputGroup.Append>
        //                         <button onClick={downloadFile}>
        //                             Download
        //                         </button>
        //                     </InputGroup.Append>
        //                 </InputGroup>
        //             ) : (
        //                 <DownloadProgressBar percentage={uploadPercentage} />
        //             )}
        //         </div>
        //     </Card.Body>
        // </Card>
    );
}
export default Receive;