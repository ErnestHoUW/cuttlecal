import React, { useEffect, useState } from 'react'
import FileUpload from '../components/FileUpload'
import GraphContainer from '../components/GraphContainer';
import axios from "axios";
// import { Button } from 'react-bootstrap';
import "../styles/Upload.css";
import {Button} from 'antd'
import { UploadOutlined } from '@ant-design/icons';


const url = `http://${window.location.host.split(":")[0]}:3001`;

export default function Upload() {
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [fileJSON, setFileJSON] = useState(null)
  const [jsonData, setJsonData] = useState(null)
  const [diffFile, setDiffFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [interpolationData, setInterpolationData] = useState([])

  const handleCompareButton = async () => {
    setLoading(true)
    const formData = new FormData();
    formData.append("files", fileA);
    formData.append("files", fileB);

    const response = await axios.post(url + "/interpolatorData", formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    ).then(function response(response) {
      const data = response.data;
      setInterpolationData(data)
      console.log(data)
      setLoading(false)
      // setDiffFile(data.diffFile);
    }).catch(function (error){
      console.log(error)
    });
  }

  useEffect(() => {
    const readFileContent = (file) => {
      const reader = new FileReader();

      reader.onload = function(event) {
        try {
          // Parse the file content as JSON
          const parsedData = JSON.parse(event.target.result);
          // Set the parsed JSON data to the state variable
          setInterpolationData(parsedData);
          console.log(parsedData); // Optional: to see the parsed data in the console
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };

      reader.readAsText(file);
    };

    if (fileJSON) {
      readFileContent(fileJSON);
    }
  }, [fileJSON]);

  return (
    <div
      className="panel"
      style={{
        height: `calc(100vh - 56px)`,
      }}
    >
      <GraphContainer diffFile={diffFile} interpolationData={interpolationData}/>

      <div className="button-containerr">
        <div>{fileA?.name || "No File Selected"}</div>
        <FileUpload file={fileA} setFile={setFileA} />
        <div>{fileB?.name || "No File Selected"}</div>
        <FileUpload file={fileB} setFile={setFileB} />
        <FileUpload file={fileJSON} setFile={setFileJSON}/>
      </div>
      {!loading ? <Button onClick={() => handleCompareButton()} disabled={!fileA || !fileB} size={100}>Compare</Button> : <div>Loading...</div>}
      

    </div>
  )
}
