import React from 'react';
import '../styles/Home.css'; // Make sure to create this CSS module

const Home = () => {
  return (
    <div className="landingContainer">
      <div className="mainContent">
        <h1>Welcome to CuttleCal!</h1>
        <p>
          CuttleCal is your gateway to achieving unparalleled consistency in color across your digital screens. 
          Designed for everyone from professional graphic designers to digital art enthusiasts, CuttleCal offers 
          a simple, accessible, and cost-effective solution to the age-old problem of display calibration.
        </p>
        <h2>What is CuttleCal?</h2>
        <p>
          Leveraging everyday webcams and a unique dark webcam enclosure, CuttleCal precisely measures and synchronizes 
          color settings across multiple displays. By sampling and analyzing Red (R), Green (G), and Blue (B) components, 
          CuttleCal not only identifies but also visually represents the differences in color, guiding you towards perfect 
          calibration.
        </p>
        <h2>Getting Started</h2>
        <ol>
          <li>Mount the dark webcam enclosure on your monitor.</li>
          <li>Follow the on-screen instructions to capture color data.</li>
          <li>Apply recommended adjustments to sync your displays.</li>
          <li>Use the graphical representation for fine-tuning.</li>
        </ol>
        <p>
          Detailed instructions and advanced features are available on each page within the application, 
          ensuring you have all the tools necessary for precise calibration.
        </p>
        <p>
          Embrace the future of display calibration with CuttleCal – where accuracy meets accessibility.
        </p>
      </div>
    </div>
  );
};

export default Home;