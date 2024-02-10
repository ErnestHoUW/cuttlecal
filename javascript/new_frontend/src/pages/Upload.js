import React, { useState } from 'react'
import FileUpload from '../components/FileUpload'
import GraphContainer from '../components/GraphContainer';

export default function Upload() {
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [diffFile, setDiffFile] = useState(null);

  return (
     <div
      className="panel"
      style={{
        height: `calc(100vh - 56px)`,
      }}
    >
      <GraphContainer diffFile={diffFile} />

      <div className="button-container">
       <FileUpload file={fileA} setFile={setFileA}/> 
       <FileUpload file={fileB} setFile={setFileB}/> 
      </div>


    </div>
  )
}
