import React, { useState, useEffect, useRef } from "react";
import useFullscreen from './useFullScreen';
import QRCode from 'qrcode.react';
import axios from 'axios';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import MyNavbar from "./MyNavbar";

const ColourChangeScreen = ({ apiUrl }) => {
    const [timeInterval, setTimeInterval] = useState(null);
    const [colourList, setColourList] = useState([]);
    const [currentColour, setCurrentColour] = useState([100, 100, 100]);
    const [bgColor, setBgColor] = useState(`rgb(${currentColour})`);
    const [pointer, setPointer] = useState(0);
    const [qrSize, setQrSize] = useState(128); 
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight }); 
    const [isFullscreen, goFullscreen, exitFullscreen] = useFullscreen(); 
    const elementRef = useRef(null); 
    const [isStarted, setIsStarted] = useState(false); 
    const [showQR, setShowQR] = useState(true);
    const [endQR, setEndQR] = useState(false);

    const updateWindowDimensions = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }

    const toggleFullscreen = () => {
        if (!isFullscreen) {
            goFullscreen(elementRef.current);
        } else {
            exitFullscreen();
        }
    };

    const startCalibration = () => {
        try {
                axios.get(apiUrl+"/startCalibration");
            } catch (error) {
                console.error('Error:', error);
            }
    };

    useEffect(() => {
        window.addEventListener('resize', updateWindowDimensions);
        return () => window.removeEventListener('resize', updateWindowDimensions);
    }, []);

    useEffect(() => {
        async function makeRequest(url, delay = 1000) {
            try {
                const response = await axios.get(url);
                const r = response.data
                console.log(response.data)
                if (Array.isArray(r.colors)) {
                    setColourList(r.colors);
                    setTimeInterval(r.frame_length);
                    // console.log(r.colors);
                    console.log(r.frame_length);
                } else {
                    console.log("No colors in /colors");
                    setTimeout(() => makeRequest(url, delay), delay);
                }
              } catch (error) {
                console.error('Error:', error);
                // If the request fails, try again after a delay
                setTimeout(() => makeRequest(url, delay), delay);
            }
        }
        if (colourList.length === 0 && isStarted ) {
            setShowQR(false)
            makeRequest(apiUrl+"/colors")
        }
    }, [apiUrl, isStarted, colourList.length]);

    useEffect(() => {
        if (colourList.length > 0 && colourList[pointer]) {
            setCurrentColour(colourList[pointer]);
            setBgColor(`rgb(${colourList[pointer]})`);
        }
    }, [pointer, colourList]);

    let qrValue = JSON.stringify(currentColour).slice(1,-1);
    if (endQR){
        qrValue = "end"
    }

    useEffect(() => {
        if (isStarted && colourList.length > 0) {
            setShowQR(true)
            setEndQR(false)
            const intervalId = setInterval(() => {
                setPointer(pointer => {
                    if (pointer >= colourList.length - 1) {
                        //setIsStarted(false); // Stop the color change
                        setBgColor('rgb(100, 100, 100)'); // Set the screen back to white
                        setColourList([]);
                        setEndQR(true);
                        return 0; // Reset the pointer
                    }

                    return pointer + 1;
                });
            }, timeInterval);

            return () => clearInterval(intervalId);
        }
    }, [colourList.length, isStarted, timeInterval]);

    

    return (
        <div
            ref={elementRef}
            style={{
                backgroundColor: bgColor,
                height: isFullscreen ? '100%' : `${windowSize.height}px`,
                width: isFullscreen ? '100%' : `${windowSize.width}px`
            }}
        >
            { showQR && 
                <QRCode
                    value={qrValue}
                    size={qrSize}
                    level={"H"}
                    includeMargin={false}
                    fgColour="#000000"
                    bgColour="#FFFFFF"
                    style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                />
            }
            <input type="range" min="50" max="500" value={qrSize} onChange={(e) => setQrSize(parseInt(e.target.value))} style={{ position: 'fixed', bottom: '10%', left: '2%', width:'20vw' }} />
            <Button onClick={toggleFullscreen} style={{ position: 'fixed', right: '2%', bottom: '10%', fontSize: '1.5vw', marginRight: '1.5vw'}}>Toggle Fullscreen</Button>
            {!isStarted && 
                <div>
                    <MyNavbar></MyNavbar>
                    <Button 
                        onClick={() => { 
                            setIsStarted(true);
                            startCalibration();
                            setPointer(0); // Ensure starting from the first element
                        }} 
                        style={{ position: 'fixed', right: '2%', bottom: '20%', fontSize: '1.5vw', marginRight: '1.5vw' }}>
                            Start
                    </Button>
                </div>
            }
        </div>
    );
};

ColourChangeScreen.propTypes = {
    apiUrl: PropTypes.string.isRequired,
};

export default ColourChangeScreen;
