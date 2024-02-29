import React, { useEffect, useState, useRef } from 'react'
import FileUpload from '../components/FileUpload'
import GraphContainer from '../components/GraphContainer';
import axios from "axios";

import "../styles/Upload.css";

import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Slider, Col, InputNumber, ConfigProvider, Tour } from 'antd'
import { useInterpolationData } from '../InterpolationDataContext';

/* eslint-disable import/no-webpack-loader-syntax */
import Worker from "worker-loader!../workers/parserWorker";

const url = `http://${window.location.host.split(":")[0]}:3001`;

export default function Upload() {
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [fileJSON, setFileJSON] = useState(null)
  const [diffFile, setDiffFile] = useState(null);
  const [bValue, setBValue] = useState(128);
  const [debouncedBValue, setDebouncedBValue] = useState(128)
  const [loading, setLoading] = useState(false);
  const { interpolationData, setInterpolationData } = useInterpolationData();
  const [open, setOpen] = useState(false);

  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref5 = useRef(null);
  const ref6 = useRef(null);

  const steps = [
    {
      title: 'Upload Page',
      description: "This page generates 3D plots to visualize color differences between two monitors.",
      cover: (
        <img
          alt="tour.png"
          src="https://user-images.githubusercontent.com/5378891/197385811-55df8480-7ff4-44bd-9d43-a7dade598d70.png"
        />
      ),
      target: () => ref1.current,
    },
    {
      title: 'Graphs',
      description: "View the rendered graphs at the centre of the screen after color differences are calculated.",
      target: () => ref2.current,
    },
    {
      title: 'Upload',
      description: "Upload a CSV for each monitor's color data, or a JSON for pre-calculated data.",
      target: () => ref3.current,
      placement: "top"
    },
    {
      title: 'B Value',
      description: "Adjust the B value using the slider or input field",
      target: () => ref5.current,
      placement: "top"
    },
    {
      title: 'Compare',
      description: "After uploading CSV or JSON, press 'Compare' to start the calculation. This may take a few minutes.",
      target: () => ref6.current,
    },
  ];



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
      setDiffFile(data.diffFile);
    }).catch(function (error) {
      console.log(error)
    });
  }

  useEffect(() => {
    const worker = new Worker('../workers/parserWorker.js');

    worker.onmessage = function(e) {
        const { success, data, error } = e.data;
        if (success) {
            setInterpolationData(data);
        } else {
            console.error('Error parsing JSON:', error);
        }
    };

    if (fileJSON) {
      worker.postMessage(fileJSON);
    }

    return () => {
        worker.terminate();
    };
}, [fileJSON]);


useEffect(() => {
  const delayDebounceFn = setTimeout(() => {
    setDebouncedBValue(bValue);
  }, 1000);

  return () => {
    clearTimeout(delayDebounceFn);
  }
}, [bValue]);

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
        <GraphContainer bValue={debouncedBValue} diffFile={diffFile} interpolationData={interpolationData} ref={ref2}/>
        <div style={{ display: "flex", gap: "30px" }}>
          <div ref={ref3} className="button-containerr">
            <div >{fileA?.name || "No File Selected"}</div>
            <FileUpload file={fileA} setFile={setFileA} fileType="CSV" />
            <div>{fileB?.name || "No File Selected"}</div>
            <FileUpload file={fileB} setFile={setFileB} fileType="CSV" />
            <div>{fileJSON?.name || "No JSON File Selected"}</div>
            <FileUpload file={fileJSON} setFile={setFileJSON} fileType="JSON" />
          </div>
          <>
            <div  style={{ display: "flex", flexDirection: "column", gap: "15px"}}>
              <h6 ref={ref5}>Enter B Value</h6>
              <div style={{ display: "flex", flexDirection: "row" }}>
                <Col span={18}>
                  <Slider
                    min={0}
                    max={255}
                    value={bValue}
                    onChange={value => setBValue(value)}
                    railSize={100}
                    width="100px"
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
              </div>
            </div>
          </>
        </div>

        <div style={{ display: "flex", gap: "30px" }}>
          {!loading ?
            <Button ref={ref6} onClick={() => handleCompareButton()} disabled={!fileA || !fileB} size="large">Compare</Button>
            : <div>Loading...</div>}
          <Button icon={<QuestionCircleOutlined />} type="default"
            size="large"
            onClick={() => setOpen(true)}
          >
            Help
          </Button>
        </div>
        <Tour open={open} onClose={() => setOpen(false)} steps={steps} />
      </div>
    </ConfigProvider>
  )
}
