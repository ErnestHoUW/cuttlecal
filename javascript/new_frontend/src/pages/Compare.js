import React, { useState, useEffect } from 'react'
import { InputNumber, Button } from 'antd';
import { useInterpolationData } from '../InterpolationDataContext';


export default function Compare() {
  const [valueR, setValueR] = useState(0);
  const [valueG, setValueG] = useState(0);
  const [valueB, setValueB] = useState(0);
  const [panelAColor, setPanelAColor] = useState('rgb(0,0,0)');
  const [panelBColor, setPanelBColor] = useState('rgb(0,0,0)');
  const { interpolationData } = useInterpolationData();

  function handleButton(toAdd) {
    setPanelAColor(`rgb(${valueR}, ${valueG}, ${valueB}, 1)`)
    if (interpolationData) {
      console.log('hi')
      let offsetArr = interpolationData[valueR][valueG][valueB]
      if (toAdd) {
        setPanelBColor(`rgb(${valueR + offsetArr[0]}, ${valueG + offsetArr[1]}, ${valueB + offsetArr[2]}, 1)`)
      }
      else {
        console.log(`rgb(${valueR - offsetArr[0]}, ${valueG - offsetArr[1]}, ${valueB - offsetArr[2]})`)
        setPanelBColor(`rgb(${valueR - offsetArr[0]}, ${valueG - offsetArr[1]}, ${valueB - offsetArr[2]}, 1)`)
      }
    }
    else {
      setPanelBColor(`rgb(${valueR}, ${valueG}, ${valueB}, 1)`)
    }
  }

  return (
    <div className="panel" style={{ display: "flex", flexDirection: "column", height: "100vh-56px" }}>
      <div style={{ display: "flex", flexGrow: 1, gap:"30px" }}>
        <div
          style={{ flexGrow: 1, background: panelAColor, height: "50vh", width: "50vw"}}
        >
        </div>
        <div
          style={{ flexGrow: 1, background: panelBColor, height: "50vh", width: "50vw"}}
        >
        </div>
      </div>
      <div style={{ padding: "20px" }}>
        <InputNumber min={0} max={255} defaultValue={0} value={valueR} onChange={value => setValueR(value)} addonAfter="R" />
        <InputNumber min={0} max={255} defaultValue={0} value={valueG} onChange={value => setValueG(value)} addonAfter="G" />
        <InputNumber min={0} max={255} defaultValue={0} value={valueB} onChange={value => setValueB(value)} addonAfter="B" />
        <Button onClick={() => handleButton(true)}>+</Button>
        <Button onClick={() => handleButton(false)}>-</Button>
      </div>
    </div>

  )
}
