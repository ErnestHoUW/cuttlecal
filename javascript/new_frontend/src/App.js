import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MyNavbar from './components/MyNavbar';
import Home from './pages/Home';
import Calibration from './pages/Calibration';
import Upload from './pages/Upload';
import Compare from './pages/Compare';
import ImageCompare from './pages/Image';
import { InterpolationDataProvider } from './InterpolationDataContext';

import PosterLeft from "./images/FYDP_Poster_Left.png";
import PosterRight from "./images/FYDP_Poster_Right.png";
import BlockDiagram from "./images/block_diagram.png";

function App() {
  useEffect(() => {
    const imagesToPreload = [PosterLeft, PosterRight, BlockDiagram];
    imagesToPreload.forEach(imageSrc => {
      const img = new Image();
      img.src = imageSrc;
    });
  }, []);

  return (
    <Router>
      <InterpolationDataProvider> 
        <MyNavbar />
        <Routes>
          <Route index element={<Home />} />
          <Route path="/calibration" element={<Calibration />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/image" element={<ImageCompare />} />
        </Routes>
      </InterpolationDataProvider>
    </Router>
  );
}

export default App;
