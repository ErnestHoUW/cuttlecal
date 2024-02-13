import React from 'react';
import Plot from 'react-plotly.js';
import TriangleA from './trianglea.gif';
import "../styles/Graph.css";

export default function Graph({ data }) {
  // Generate custom colors based on the x and y indices
  const colors = data ? data.map((row, x) => 
    row.map((_, y) => (x,0,0)) // Color based on position
  ) : [];

  console.log(colors[0])

  return (
    <div>
      {data ? (
        <Plot
          data={[
            {
              z: data,
              type: 'surface',
              surfacecolor: colors, // Apply custom colors
              showscale: false 
            },
          ]}
          layout={{
            title: '3D Surface Plot',
            autosize: true,
            margin: {
              l: 65,
              r: 50,
              b: 65,
              t: 90,
            },
            scene: {
              xaxis: { title: 'Red' },
              yaxis: { title: 'Green' },
              zaxis: { title: 'Diff' },
            }
          }}
        />
      ) : (
        <img src={TriangleA} alt="triangle" width="400" height="400" />
      )}
    </div>
  );
}
