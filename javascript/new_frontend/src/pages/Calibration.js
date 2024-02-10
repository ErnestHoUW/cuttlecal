import React, { useEffect, useState } from "react";
import QRCode from "qrcode.react";
import { Button } from "react-bootstrap";
import axios from "axios";
import "../styles/Calibration.css";

const url = `http://${window.location.host.split(":")[0]}:3001`;
export default function Calibration(props) {
  const [color, setColor] = useState("127, 127, 127");
  const [calibrating, setCalibrating] = useState(false);
  const [calibrationColors, setCalibrationColors] = useState([]);
  const [index, setIndex] = useState(0);
  const [timeInterval, setTimeInterval] = useState(5);

  function handleStartMeasurement() {
    try {
      axios.get(url + "/startCalibration");
    } catch (error) {
      console.error("Error:", error);
    }
    setCalibrating(true);
  }

  useEffect(() => {
    if (!calibrating) return;

    async function getCalibrationColors() {
      try {
        const response = await axios.get(url + "/colors");
        const data = response.data;
        if (Array.isArray(data.colors) && data.colors.length > 0) {
          setCalibrationColors(data.colors);
          setTimeInterval(data.frame_length);
          console.log(data.frame_length);
          await axios.post(url + "/colorDisplayStatus", { status: true });
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
          setCalibrating(false);
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

  return (
    <div
      className="panel"
      style={{
        backgroundColor: `rgb(${color})`,
        height: `calc(100vh - 56px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          padding: `${10}px`, // 10% of qrSize as padding
          backgroundColor: "#FFFFFF", // White background for the border
          display: "inline-block", // Use inline-block for the div to fit the size of the QRCode plus padding
        }}
      >
        <QRCode
          value={JSON.stringify(color).slice(1, -1)}
          level={"H"}
          size={200}
        />
      </div>

      {!calibrating && (
        <Button
          className="measure-button"
          onClick={() => handleStartMeasurement()}
        >
          Start Measuring
        </Button>
      )}
    </div>
  );
}
