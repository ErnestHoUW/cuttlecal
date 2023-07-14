import React, { useState } from "react";
import QRCode from 'qrcode.react';

const ColorChangeScreen = () => {
  const [color, setColor] = useState([255, 255, 255]); // initial color is white

  const changeColor = (event) => {
    let hexColor = event.target.value;
    let r = parseInt(hexColor.slice(1,3), 16);
    let g = parseInt(hexColor.slice(3,5), 16);
    let b = parseInt(hexColor.slice(5,7), 16);
    setColor([r, g, b]);
  };

  let rgbColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  let qrValue = JSON.stringify(color);

  return (
    <div style={{ backgroundColor: rgbColor, height: '100vh', width: '100%' }}>
      <input 
        type="color" 
        value={rgbColor} 
        onChange={changeColor}
        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      />
      <QRCode 
        value={qrValue} 
        size={128}
        level={"H"}
        includeMargin={true}
        style={{ position: 'absolute', bottom: '20px', left: '20px'}}
      />
    </div>
  );
};

export default ColorChangeScreen;
