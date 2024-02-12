import React from 'react'
import { Button } from 'react-bootstrap'
import "../styles/FileUpload.css";

export default function FileUpload({ file, setFile }) {
    const fileInputRef = React.createRef();

    const handleFileChange = (event) => {
        const uploadedFile = event.target.files[0]
        setFile(uploadedFile);
    }

    return (
        <div className="upload-button-container">
            <input
                type="file"
                style={{ display: 'none' }} // Hide the file input
                ref={fileInputRef}
                onChange={(e) => handleFileChange(e)}
            />
            <div>{file?.name || "No File Selected"}</div>
            <Button onClick={() => fileInputRef.current.click()}>
                Upload CSV
            </Button>
        </div>
    )
}
