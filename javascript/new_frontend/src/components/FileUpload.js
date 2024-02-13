import React from 'react'
import { Button } from 'antd'
import { UploadOutlined } from '@ant-design/icons';
import "../styles/FileUpload.css";

export default function FileUpload({ file, setFile, fileType }) {
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
            <Button onClick={() => fileInputRef.current.click()} icon={<UploadOutlined />}>
                Upload {fileType}
            </Button>
        </div>
    )
}
