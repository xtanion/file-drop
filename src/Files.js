const fs = require('fs');
function preprocessFile(file) {
    let reader = new FileReader();
    reader.onload = (a) => {
        let buffer = new Uint8Array(reader.result);
        const metadata = {
            filename: file.name,
            total_buffer_size: buffer.length,
            buffer_size: 1024
        }
        return {
            metadata: metadata,
            buffer: buffer
        } 
    }
    reader.readAsArrayBuffer(file);
}

function shareFile(metadata, buffer, progress_node) {
    socket.emit("file-meta", {
        uid: receiverID,
        metadata: metadata
    });

    socket.on("fs-share", function () {
        let chunk = buffer.slice(0, metadata.buffer_size);
        buffer = buffer.slice(metadata.buffer_size, buffer.length);
        progress_node.innerText = Math.trunc(((metadata.total_buffer_size - buffer.length) / metadata.total_buffer_size * 100));
        if (chunk.length != 0) {
            socket.emit("file-raw", {
                uid: receiverID,
                buffer: chunk
            });
        } else {
            console.log("Sent file successfully");
        }
    });
}