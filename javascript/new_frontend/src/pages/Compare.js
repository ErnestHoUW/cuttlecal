import React, { useState, useRef } from 'react'
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, InputNumber, Tour } from "antd";
import { ExpandOutlined } from '@ant-design/icons';
import { useInterpolationData } from '../InterpolationDataContext';



export default function Compare() {
  const [valueR, setValueR] = useState(150);
  const [valueG, setValueG] = useState(50);
  const [valueB, setValueB] = useState(50);
  const [panelAColor, setPanelAColor] = useState('rgb(150,50,50)');
  const [panelBColor, setPanelBColor] = useState('rgb(150,50,50)');

  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(true);

  const { interpolationData } = useInterpolationData();

  const [open, setOpen] = useState(false);

  const [toAdd, setToAdd] = useState(true);

  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);
  const ref5 = useRef(null);
  const ref6 = useRef(null);
  const ref7 = useRef(null);

  const steps = [
    {
      title: "Compare Page Overview",
      description: "This Compare page displays the color in your current monitor versus that same color in a different monitor, based on the JSON document you uploaded in the Upload Page.",
      target: () => ref1.current
    },
    {
      title: "Your Monitor's Color",
      description: "The left side of the screen shows the color for your monitor.",
      placement: "left",
      target: () => ref2.current
    },
    {
      title: "Other Monitor's Color",
      description: "The right side of the screen displays the color of the other monitor.",
      placement: "right",
      target: () => ref3.current
    },
    {
      title: "RGB Input and Adjustment",
      description: "Input the RGB values for your desired color to compare, then use the plus and minus signs to adjust the difference between the monitors' colors at that color.",
      placement: "bottom",
      target: () => ref4.current
    },
    {
      title: "Subtract/Add RGB Difference",
      description: "Use this button to adjust the difference between the monitors' colors at that color.",
      placement: "bottom",
      target: () => ref5.current
    },
    {
      title: "Show/Hide Images",
      description: "Use these buttons to show or hide the left/right images",
      target: () => ref6.current
    },
    {
      title: "Pop Images",
      description: "Use these buttons to open the left/right image in another tab",
      target: () => ref7.current
    }
  ]


  function handleButton() {
    setPanelAColor(`rgb(${valueR}, ${valueG}, ${valueB}, 1)`)
    if (interpolationData) {
      let offsetArr = interpolationData[valueR][valueG][valueB];

      if (toAdd) {
        setPanelBColor(`rgb(${valueR + offsetArr[0]}, ${valueG + offsetArr[1]}, ${valueB + offsetArr[2]}, 1)`)
      }
      else {
        setPanelBColor(`rgb(${valueR - offsetArr[0]}, ${valueG - offsetArr[1]}, ${valueB - offsetArr[2]}, 1)`)
      }
    }
    else {
      setPanelBColor(`rgb(${valueR}, ${valueG}, ${valueB}, 1)`)
    }
  }

  const panelAWindowRef = useRef(null);
  const panelBWindowRef = useRef(null);

  const openPanelAInNewWindow = () => {
    if (panelAWindowRef.current && !panelAWindowRef.current.closed) {
      panelAWindowRef.current.close();
    }

    const newWindow = window.open();
    newWindow.document.write(`
        <style>
            body { margin: 0; overflow: hidden; display: flex; justify-content: center; align-items: center; width: 100vw; height: 100vh; }
            div { width: 100%; height: 100%; background: ${panelAColor}; }
        </style>
        <div></div>
    `);
    newWindow.document.title = "Original Digital Colour"; // Set the window title here
    newWindow.document.close();

    panelAWindowRef.current = newWindow;
  };

  const openPanelBInNewWindow = () => {
    if (panelBWindowRef.current && !panelBWindowRef.current.closed) {
      panelBWindowRef.current.close();
    }

    const newWindow = window.open();
    newWindow.document.write(`
        <style>
            body { margin: 0; overflow: hidden; display: flex; justify-content: center; align-items: center; width: 100vw; height: 100vh; }
            div { width: 100%; height: 100%; background: ${panelBColor}; }
        </style>
        <div></div>
    `);
    newWindow.document.title = "Calibrated Colour"; // Set the window title here
    newWindow.document.close();

    panelBWindowRef.current = newWindow;
  };


  return (
    <div className="panel" style={{ flexDirection: "column", height: "100vh-56px", padding: "5px" }}>
      <div style={{ display: "flex", flexGrow: 1 }}>
        {showLeft &&
          <div
            style={{ flexGrow: 1, background: panelAColor, height: "50vh", width: showRight ? "49vw" : "100vw", marginRight: showRight ? "30px" : "0px" }}
            ref={ref2}
          >
          </div>
        }
        {showRight &&
          <div
            style={{ flexGrow: 1, background: panelBColor, height: "50vh", width: showLeft ? "49vw" : "100vw" }}
            ref={ref3}
          >
          </div>
        }
        {
          !showLeft && !showRight &&
          <div style={{ flexGrow: 1, height: "50vh", background: "white" }}></div>
        }
      </div>
      <div>{!interpolationData && "No JSON Found"}</div>
      <div style={{ display: "flex", flexDirection: "row", padding: "20px" }} ref={ref4}>
        <InputNumber style={{ marginRight: "15px" }} disabled={!interpolationData} min={0} max={255} defaultValue={0} value={valueR} onChange={value => {
          if (!value){
            value = 0
          }
          setValueR(value)
          handleButton()
        }} addonAfter="R" />
        <InputNumber style={{ marginRight: "15px" }} disabled={!interpolationData} min={0} max={255} defaultValue={0} value={valueG} onChange={value => {
          if (!value){
            value = 0
          }
          setValueG(value)
          handleButton()
        }} addonAfter="G" />
        <InputNumber disabled={!interpolationData} min={0} max={255} defaultValue={0} value={valueB} onChange={value => {
          if (!value){
            value = 0
          }
          setValueB(value)
          handleButton()
        }} addonAfter="B" />
      </div>
      <div style={{ display: "flex", flexDirection: "row", padding: "20px" }}>
        <div ref={ref5}>
          <Button style={{ marginRight: "15px" }} onClick={() => {
            setToAdd(!toAdd);
            handleButton()
          }} disabled={!interpolationData}>{toAdd ? "Add RGB Difference" : "Subtract RGB Difference"}</Button>
        </div>
        <div ref={ref6}>
          <Button style={{ marginRight: "15px" }} onClick={() => setShowLeft(!showLeft)}>{showLeft ? "Hide Left" : "Show Left"}</Button>
          <Button style={{ marginRight: "15px" }} onClick={() => setShowRight(!showRight)}>{showRight ? "Hide Right" : "Show Right"}</Button>
        </div>
        <div ref={ref7}>
          <Button style={{ marginRight: "15px" }} onClick={openPanelAInNewWindow} disabled={!interpolationData} icon={<ExpandOutlined />}>Pop Left</Button>
          <Button style={{ marginRight: "15px" }} onClick={openPanelBInNewWindow} disabled={!interpolationData} icon={<ExpandOutlined />}>Pop Right</Button>
        </div>
        <Button icon={<QuestionCircleOutlined />} type="default"
          onClick={() => setOpen(true)}
        >
        </Button>
      </div>
      <Tour open={open} onClose={() => setOpen(false)} steps={steps} />
    </div>

  )
}
