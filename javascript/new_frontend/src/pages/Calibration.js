import React, { useEffect, useState } from "react";
import QRCode from "qrcode.react";
import { Button } from "react-bootstrap";
import axios from 'axios';
import "../styles/Calibration.css";

const url = `http://${window.location.host.split(":")[0]}:3001`;
export default function Calibration(props) {
  const [color, setColor] = useState("rgb(127, 127, 127)");
  const [calibrating, setCalibrating] = useState(false);
  const [calibrationColors, setCalibrationColors] = useState([]);

  useEffect(() => {
    if (!calibrating) return;
    
    axios.get(url + '/startCalibration');

    async function getCalibrationColors() {
      const response = await axios.get(url + '/colors');
      const data = response.data;
      if (Array.isArray(data.colors) && data.colors.length > 0) {
        let array = []
        data.colors.forEach(element => {
          array.push(`rgb(${element[0]}, ${element[1]}, ${element[2]})`)
        });
        setCalibrationColors(array);
      }
      else {
        setTimeout(() => getCalibrationColors(), 1000);
      }
    }

    getCalibrationColors();
  }, [calibrating]);

  useEffect(() => {
    if (calibrating) {
      let calibrationColorIndex = 0;
      const interval = setInterval(() => {
        if (calibrationColorIndex < calibrationColors.length) {
          const newColor = calibrationColors[calibrationColorIndex];
          setColor(newColor);
          calibrationColorIndex++;
        } else {
          setCalibrationColors([]);
          setColor("rgb(127, 127, 127)");
          setCalibrating(false);
          clearInterval(interval);

          axios.get(url + '/endCalibration');
        }
      }, 5);

      return () => clearInterval(interval);
    }
  }, [calibrationColors]);

  return (
    <div
      className="panel"
      style={{
        backgroundColor: color,
        height: `calc(100vh - 56px)`,
      }}
    >
      <QRCode value={color} level={"H"} />
      {!calibrating && (
        <Button className="measure-button" onClick={() => setCalibrating(true)}>
          Start Measuring
        </Button>
      )}
    </div>
  );
}
