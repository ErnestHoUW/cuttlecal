import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MyNavbar from './components/MyNavbar.js';
import Home from './pages/Home.js';
import Calibration from './pages/Calibration.js';
import Upload from './pages/Upload.js';
import Compare from './pages/Compare.js';

function App() {
  return (
    <Router>
      <MyNavbar />
      <Routes>
        <Route index element={<Home />} />
        <Route path="/calibration" element={<Calibration />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/compare" element={<Compare />} />
      </Routes>
    </Router>
  );
}

export default App;
