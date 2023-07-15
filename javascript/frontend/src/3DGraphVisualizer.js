import Plot from 'react-plotly.js';
import MyNavbar from './MyNavbar';

/**
 * Generate a sequence of specified length with random values scaled by a multiplier
 *
 * @param {*} length
 * @param {*} scale
 * @returns
 */
function createRandomSequence(length, scale) {
  let sequence = [];
  let indices = [];
  
  for (let j = 0; j < length; j++) {
    sequence.push(Math.random() * scale);
    indices.push(j);
  }
  
  return {indices, sequence};
}

const GraphVisualizer = () => {
  const {indices, sequence} = createRandomSequence(20, 3);
  
  const trace = {
    x: indices,
    y: Array(20).fill(0),
    z: sequence,
    type: 'scatter3d',
    mode: 'lines'
  };

  return (
    <div>
        <MyNavbar></MyNavbar>
        <Plot
        data={[trace]}
        layout={{
            width: 900,
            height: 800,
            title: `Basic 3D Line Scatter`
        }}
        />
    </div>
  );
}

export default GraphVisualizer;