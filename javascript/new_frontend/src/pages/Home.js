import React, { useState } from 'react';
import '../styles/Home.css'; // Assuming this file contains additional styles you might need
import PosterLeft from "../images/FYDP_Poster_Left.png";
import PosterRight from "../images/FYDP_Poster_Right.png";
import BlockDiagram from "../images/block_diagram.png";

const Home = () => {
  const [showBlockDiagram, setShowBlockDiagram] = useState(false);

  const toggleView = () => {
    setShowBlockDiagram(!showBlockDiagram);
  };

  return (
    <div style={{
      display: 'flex', // Use flexbox for layout
      justifyContent: showBlockDiagram ? 'center' : 'flex-start', // Center the block diagram, align posters to the start
      alignItems: 'center', // Vertically center the items
      height: 'calc(100vh - 56px)', // Full viewport height minus the header/navbar
      background: '#EFEFEF',
    }}>
      {!showBlockDiagram && (
        <>
          <img src={PosterLeft} alt="Left Poster" style={{ height: '100%' }} />
          <img src={PosterRight} alt="Right Poster" style={{ height: '100%', marginLeft: 'auto', marginRight: 'auto', cursor: 'pointer' }} onClick={toggleView} />
        </>
      )}
      {showBlockDiagram && (
        <img src={BlockDiagram} alt="Block Diagram" style={{ height: '100%', cursor: 'pointer' }} onClick={toggleView} />
      )}
    </div>
  );
};

export default Home;
