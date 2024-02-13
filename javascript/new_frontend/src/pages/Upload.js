import React, { useEffect, useState } from 'react'
import FileUpload from '../components/FileUpload'
import GraphContainer from '../components/GraphContainer';
import axios from "axios";
// import { Button } from 'react-bootstrap';
import "../styles/Upload.css";
import { Button, Slider, Col, Row, InputNumber, ConfigProvider } from 'antd'
import { useInterpolationData } from '../InterpolationDataContext';


const url = `http://${window.location.host.split(":")[0]}:3001`;

export default function Upload() {
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [fileJSON, setFileJSON] = useState(null)
  const [diffFile, setDiffFile] = useState(null);
  const [bValue, setBValue] = useState(128);
  const [loading, setLoading] = useState(false);
  const { interpolationData, setInterpolationData } = useInterpolationData();

  const handleCompareButton = async () => {
    setLoading(true)
    const formData = new FormData();
    formData.append("files", fileA);
    formData.append("files", fileB);

    await axios.post(url + "/interpolatorData", formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    ).then(function response(response) {
      const data = response.data.result;
      setInterpolationData(data)
      console.log(data)
      setLoading(false)
      // setDiffFile(data.diffFile);
    }).catch(function (error) {
      console.log(error)
    });
  }

  useEffect(() => {
    const readFileContent = (file) => {
      const reader = new FileReader();

      reader.onload = function (event) {
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
  }, [fileJSON, setInterpolationData]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Slider: {
          },
        },
      }}
    >

      <div
        className="panel"
        style={{
          height: `calc(100vh - 56px)`,
        }}
      >
        <GraphContainer bValue={bValue} diffFile={diffFile} interpolationData={interpolationData} />

        <div className="button-containerr">
          <div>{fileA?.name || "No File Selected"}</div>
          <FileUpload file={fileA} setFile={setFileA} fileType="CSV" />
          <div>{fileB?.name || "No File Selected"}</div>
          <FileUpload file={fileB} setFile={setFileB} fileType="CSV" />
          <div>{fileJSON?.name || "No JSON File Selected"}</div>
          <FileUpload file={fileJSON} setFile={setFileJSON} fileType="JSON" />
        </div>
        {!loading ?
          <Button onClick={() => handleCompareButton()} disabled={!fileA || !fileB} size={100}>Compare</Button>
          : <div>Loading...</div>}
        <h4>Enter B Value</h4>
        <Row>
          <Col span={20}>
            <Slider
              min={0}
              max={255}
              value={bValue}
              onChange={value => setBValue(value)}
              railSize={100}
            />
          </Col>
          <Col span={4}>
            <InputNumber
              min={0}
              max={255}
              style={{
                margin: '0 16px',
              }}
              value={bValue}
              onChange={value => setBValue(value)}
            />
          </Col>
        </Row>

      </div>
    </ConfigProvider>
  )
}
