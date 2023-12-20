import { useState, useRef } from "react";
import "./style.css"
const DragDropFiles = (props) => {
    const { changeFile } = props;
    const [files, setFiles] = useState(null);
    const inputRef = useRef();

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setFiles(event.dataTransfer.files);
        changeFile(event.target.files);
    };

    const handleUpload = (files) => {
        setFiles(files);
        changeFile(files[0]);
    }

    return (
        <div
            className="file-input"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <label htmlFor="file-input">Drag and Drop or Click to select</label>
            <input
                id="file-input"
                type="file"
                onChange={(e) => handleUpload(e.target.files)}
                ref={inputRef}
            />
        </div>
    );
};

export default DragDropFiles;