import React, { useEffect, useState } from 'react'
import Graph from './Graph'

import "../styles/GraphContainer.css";

function GraphContainer({ diffFile, interpolationData, bValue, RGBIncrement }) {
  const [surfacePlotR, setSurfacePlotR] = useState([[0]])
  const [surfacePlotG, setSurfacePlotG] = useState([[0]])
  const [surfacePlotB, setSurfacePlotB] = useState([[0]])
  const [maxDiff, setMaxDiff] = useState(45);


  useEffect(() => {
    const calculate = async () => {

      if (interpolationData && interpolationData.length !== 0) {
        const b = bValue; // Fixed b value
        let red_diff = []; // Initialize arr as an empty array
        let green_diff = [];
        let blue_diff = [];
        let max = 45;
        for (let g = 0; g < 256; g+=RGBIncrement) {
          let red_row = []; // Initialize a new row
          let green_row = [];
          let blue_row = [];
          for (let r = 0; r < 256; r+=RGBIncrement) {
            red_row.push(interpolationData[r][g][b][0]); // Add the value to the row
            green_row.push(interpolationData[r][g][b][1]); // Add the value to the row
            blue_row.push(interpolationData[r][g][b][2]); // Add the value to the row
            max = Math.max(max, Math.abs(red_row[red_row.length - 1]), Math.abs(green_row[green_row.length - 1]), Math.abs(blue_row[blue_row.length - 1]));
          }
          red_diff.push(red_row); // Add the row to the arr
          green_diff.push(green_row);
          blue_diff.push(blue_row);
        }
        setSurfacePlotR(red_diff);
        setSurfacePlotG(green_diff);
        setSurfacePlotB(blue_diff);
        setMaxDiff(max+5);
      }
      // Now arr is a 2D array where arr[r][g] = interpolationData[r][g][b][0]
      // You can use arr as needed here
    }
    calculate()
  }, [interpolationData, bValue, RGBIncrement]);


  return (
    <div className="graph-container">
      <Graph data={surfacePlotR} title={`Red Channel Diffs (Blue=${bValue})`} bValue={bValue} maxDiff={maxDiff} RGBIncrement={RGBIncrement} />
      <Graph data={surfacePlotG} title={`Green Channel Diffs (Blue=${bValue})`} bValue={bValue} maxDiff={maxDiff} RGBIncrement={RGBIncrement} />
      <Graph data={surfacePlotB} title={`Blue Channel Diffs (Blue=${bValue})`} bValue={bValue} maxDiff={maxDiff} RGBIncrement={RGBIncrement} />
    </div>
  )
}

export default GraphContainer