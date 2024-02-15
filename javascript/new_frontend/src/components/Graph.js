import React, { useEffect, useState, useRef }  from 'react';
import Plot from 'react-plotly.js';
import TriangleA from '../images/trianglea.gif';
import "../styles/Graph.css";

export default function Graph({ data, title }) {
  const [loaded, setLoaded] = useState(false)
  const [scatter, setScatter] = useState(null)


  // Generate scatter plot data
  let a = performance.now()
  useEffect(() => {
    if (data) {
      setLoaded(false)
      const scatterData = {
        x: [],
        y: [],
        z: [],
        mode: 'markers',
        type: 'scatter3d',
        marker: {
          size: 1,
          color: [],
          opacity: 1
        }
      };

    
      data.forEach((row, y) => {
        row.forEach((z, x) => {
          scatterData.x.push(x);
          scatterData.y.push(y);
          scatterData.z.push(z);
          scatterData.marker.color.push(`rgb(${x}, ${y}, 0)`); // Color logic based on position
        });
      });
      setScatter(scatterData)
      
  }
  console.log(performance.now() - a, "ms create scatterData")
}, [data])

  return (
    <div>
      {!loaded && <div>Change bValue once to show plots</div>}
      {data ? (
        <Plot
        style={{ display: loaded ? 'block' : 'none' }}
          data={[
            {
              z: data,
              type: 'surface',
              showscale: false,
              colorscale: [
                [0, 'rgb(0, 0, 0)'], // Light Gray
                [0.5, 'rgb(128, 128, 128)'], // Medium Gray
                [1, 'rgb(255, 255, 255)'] // Dark Gray
              ]
            },
            scatter // Include the scatter plot data
          ]}
          layout={{
            title: title,
            autosize: true,
            margin: {
              l: 0,
              r: 0,
              b: 0,
              t: 60,
            },
            scene: {
              xaxis: { title: 'Red Channel' },
              yaxis: { title: 'Green Channel' },
              zaxis: { title: 'Ref - Target' },
            }
          }}

          onAfterPlot	={() => {
            setLoaded(true)
            console.log(performance.now()-a, "ms POGGGGERS")}}
        />
      ) : (
        <img src={TriangleA} alt="triangle" width="400" height="400" />
      )}
    </div>
  );
}
