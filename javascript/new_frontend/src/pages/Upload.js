import React, { useState } from 'react'
import FileUpload from '../components/FileUpload'
import GraphContainer from '../components/GraphContainer';
import axios from "axios";
import { Button } from 'react-bootstrap';
import "../styles/Upload.css";

const url = `http://${window.location.host.split(":")[0]}:3001`;

export default function Upload() {
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [diffFile, setDiffFile] = useState(null);

  const handleCompareButton = async () => {
    const formData = new FormData();
    formData.append("files", fileA);
    formData.append("files", fileB);

    const response = await axios.post(url + "/interpolatorData", formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    const data = response.data;
    console.log(data)
    // setDiffFile(data.diffFile);
  }

  return (
    <div
      className="panel"
      style={{
        height: `calc(100vh - 56px)`,
      }}
    >
      <GraphContainer diffFile={diffFile} />

      <div className="button-container">
        <FileUpload file={fileA} setFile={setFileA} />
        <FileUpload file={fileB} setFile={setFileB} />
        <Button onClick={() => handleCompareButton()} disabled={!fileA || !fileB}>Compare</Button>
      </div>

    </div>
  )
}
