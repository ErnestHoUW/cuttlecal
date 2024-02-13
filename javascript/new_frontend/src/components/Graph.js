import React from 'react';
import Plot from 'react-plotly.js';
import TriangleA from './trianglea.gif';
import "../styles/Graph.css";

export default function Graph({ data, title }) {
  // Generate scatter plot data
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

  if (data) {
    data.forEach((row, y) => {
      row.forEach((z, x) => {
        scatterData.x.push(x);
        scatterData.y.push(y);
        scatterData.z.push(z);
        scatterData.marker.color.push(`rgb(${x}, ${y}, 0)`); // Color logic based on position
      });
    });
  }

  return (
    <div>
      {data ? (
        <Plot
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
            scatterData // Include the scatter plot data
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
        />
      ) : (
        <img src={TriangleA} alt="triangle" width="400" height="400" />
      )}
    </div>
  );
}
