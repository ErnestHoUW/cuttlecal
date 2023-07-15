import { useState, useEffect } from 'react';

function useFullScreen() {
  const [isFullscreen, setIsFullscreen] = useState(
    document[document.fullscreenElement] || false
  );

  useEffect(() => {
    const handleChange = () =>
      setIsFullscreen(document[document.fullscreenElement] || false);

    document.addEventListener('fullscreenchange', handleChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleChange);
    };
  }, []);

  const request = (element) => {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    }
  };

  const exit = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  return [isFullscreen, request, exit];
}

export default useFullScreen;