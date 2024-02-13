import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MyNavbar from './components/MyNavbar';
import Home from './pages/Home';
import Calibration from './pages/Calibration';
import Upload from './pages/Upload';
import Compare from './pages/Compare';
import { InterpolationDataProvider } from './InterpolationDataContext'; // Import the provider

function App() {
  return (
    <Router>
      <InterpolationDataProvider> 
        <MyNavbar />
        <Routes>
          <Route index element={<Home />} />
          <Route path="/calibration" element={<Calibration />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/compare" element={<Compare />} />
        </Routes>
      </InterpolationDataProvider>
    </Router>
  );
}

export default App;

