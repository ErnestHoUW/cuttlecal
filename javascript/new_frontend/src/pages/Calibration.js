import React, { useRef, useEffect, useState } from "react";
import QRCode from "qrcode.react";
import { QuestionCircleOutlined, DownloadOutlined, CaretRightOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, Tour, Progress } from "antd";
import axios from "axios";
import "../styles/Calibration.css";

const url = `http://${window.location.host.split(":")[0]}:3001`;

export default function Calibration() {
  const [color, setColor] = useState("127, 127, 127");
  const [calibrating, setCalibrating] = useState(false);
  const [calibrationColors, setCalibrationColors] = useState([]);
  const [index, setIndex] = useState(0);
  const [timeInterval, setTimeInterval] = useState(5);
  const [csvAvailable, setCsvAvailable] = useState(false);
  const [open, setOpen] = useState(false);
  const [showQR, setShowQR] = useState(true);

  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);
  const steps = [
    {
      title: 'Calibration Page',
      description: 'Welcome to the Calibration Page! This crucial part of CuttleCal is designed specifically for reading and analyzing your monitors color output. Here, you will embark on the first step towards achieving perfect color harmony across your devices. Please follow the instructions carefully to ensure an accurate calibration process.',
      placement: 'center',
      target: () => ref1.current,
    },
    {
      title: 'QR Code',
      description: "Ensure the webcam shroud doesn't cover the QR code for correct color reading.",
      target: () => ref2.current,
    },
    {
      title: 'Start Button',
      description: "Click 'Start' to begin calibration. Make sure everything is set up correctly first.",
      placement: 'top',
      target: () => ref3.current,
    },
    {
      title: 'Download Button',
      placement: 'top',
      description: "After calibration, click to download the results as a CSV file.",
      target: () => ref4.current,
    },
  ];

  function handleStartMeasurement() {
    setShowQR(false);
    try {
      axios.get(url + "/startCalibration");
    } catch (error) {
      console.error("Error:", error);
    }
    setCalibrating(true);
  }

  async function downloadCSV() {
    const response = await axios.get(`http://${window.location.host.split(":")[0]}:3001/downloadCSV`)
    const data = response.data;

    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'measurements.csv';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!calibrating) return;

    async function getCalibrationColors() {
      try {
        const response = await axios.get(url + "/colors");
        const data = response.data;
        if (Array.isArray(data.colors) && data.colors.length > 0) {
          setShowQR(true);
          setCalibrationColors(data.colors);
          setTimeInterval(data.frame_length);
          console.log(data.frame_length);
          // await axios.post(url + "/colorDisplayStatus", { status: true });
        } else {
          setTimeout(() => getCalibrationColors(), 1000);
        }
      } catch (error) {
        console.error("Error:", error);
        // Post to /colorDisplayStatus with false in case of an error
        await axios.post(url + "/colorDisplayStatus", { status: false });
        // If the request fails, try again after a delay
        setTimeout(() => getCalibrationColors(), 1000);
      }
    }

    if (calibrationColors.length === 0 && calibrating) {
      getCalibrationColors();
    }
  }, [calibrating, calibrationColors.length]);

  useEffect(() => {
    if (calibrating && calibrationColors.length > 0) {
      // let calibrationColorIndex = 0;
      const interval = setInterval(() => {
        if (index < calibrationColors.length) {
          // const newColor = calibrationColors[calibrationColorIndex];
          const newColor = calibrationColors[index];
          setColor(newColor);
          setIndex(index + 1);
        } else {
          setCalibrationColors([]);
          setColor("127, 127, 127");
          setShowQR(false);
          //setCalibrating(false);
          clearInterval(interval);

          const updateColorDisplayStatus = async () => {
            await axios
              .post(url + "/colorDisplayStatus", { status: false })
              .catch((error) =>
                console.error("Error updating color display status:", error)
              );
          };

          updateColorDisplayStatus(); // Call the async function

          const checkCalibrationStatus = () => {
            axios
              .get(url + "/calibrationStatus")
              .then((response) => {
                const data = response.data;
                if (!data.calibrating) {
                  setCalibrating(false); // Stop the color change
                  setShowQR(true);
                } else {
                  // If still calibrating, check again after 1 second
                  setTimeout(checkCalibrationStatus, 1000);
                }
              })
              .catch((error) =>
                console.error("Error checking calibration status:", error)
              );
          };

          checkCalibrationStatus();
          setIndex(0);
        }
      }, timeInterval);
      return () => clearInterval(interval);
    }
  }, [
    calibrationColors.length,
    calibrating,
    timeInterval,
    index,
    calibrationColors,
  ]);

  useEffect(() => {
    async function pollCSV() {
      try {
      const response = await axios.get(url + "/checkCSV");
      const data = response.data;
      if (data.result) {
        setCsvAvailable(true);
      }
      else {
        setCsvAvailable(false);
        setTimeout(() => pollCSV(), 1000);
      }
    }
    catch(e) {
        setCsvAvailable(false);
        setTimeout(() => pollCSV(), 1000);
      }
    }

    if (!csvAvailable) {
      pollCSV();
    }
  }, [csvAvailable])

  return (
    <ConfigProvider
      theme={{
        Button: {
          /* here is your component tokens */
        },
      }}
    >
      <div
        className="panel"
        style={{
          backgroundColor: `rgb(${color})`,
          height: `calc(100vh - 56px)`,
        }}
      >
        {showQR && <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: `${10}px`, // 10% of qrSize as padding
            backgroundColor: "#FFFFFF", // White background for the border
            display: "flex"
          }}
          ref={ref2}
        >
          <QRCode
            value={JSON.stringify(color).slice(1, -1)}
            level={"H"}
            size={100}
          />
        </div>}
        {!calibrating &&
          <div className="button-container">
            <Button
              icon={<CaretRightOutlined />}
              onClick={() => handleStartMeasurement()}
              size="large"
              type="primary"
              ref={ref3}
            >
              Start
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => downloadCSV()}
              disabled={!csvAvailable}
              description="download"
              type="primary"
              size="large"
              ref={ref4}
            >
              Download
            </Button>
            <Button icon={<QuestionCircleOutlined />} type="primary"
              size="large"
              onClick={() => setOpen(true)}
            >
              Help
            </Button>
          </div>
        }

        <div className="container">
          <Progress
            percent={calibrationColors.length === 0 ? 0 : (index*100 / calibrationColors.length).toFixed(2)}
            status="active"
            strokeColor={{
              from: '#108ee9',
              to: '#87d068',
            }}
          />
        </div>
        <Tour open={open} onClose={() => setOpen(false)} steps={steps} />

      </div>
    </ConfigProvider>
  );
}
