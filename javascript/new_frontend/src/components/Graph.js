import React, { useEffect, useState }  from 'react';
import Plot from 'react-plotly.js';
import "../styles/Graph.css";

export default function Graph({ data, title, bValue }) {
  const [scatter, setScatter] = useState(null)


  // Generate scatter plot data
  useEffect(() => {
    if (data) {
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
          scatterData.marker.color.push(`rgb(${x}, ${y}, ${bValue})`); // Color logic based on position
        });
      });
      setScatter(scatterData)
      
  }
}, [data])

  return (
    <div>
      {//data ? (
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
            scatter // Include the scatter plot data
          ]}
          layout={{
            title: title,
            autosize: false,
            width: 500,
            height: 500,
            margin: {
              l: 0,
              r: 0,
              b: 0,
              t: 100,
            },
            scene: {
              xaxis: { title: 'Red Channel' },
              yaxis: { title: 'Green Channel' },
              zaxis: { title: 'Ref - Target',
            range: [-50, 50] },
            }
          }}/>
      // ) : (
      //  <h1>Please upload a file</h1>
      // )}
         } </div>
  );
}
