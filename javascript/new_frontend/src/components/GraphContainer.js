import React from 'react'
import Graph from './Graph'

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