import React from 'react'
import Graph from './Graph'
import "../styles/GraphContainer.css";

function GraphContainer({ diffFile }) {
  return (
    <div className="graph-container">
        <Graph />
        <Graph />
        <Graph />
    </div>
  )
}

export default GraphContainer