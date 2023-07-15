import React, { useState, useEffect, useRef } from "react";
import useFullscreen from './useFullScreen';
import QRCode from 'qrcode.react';
import axios from 'axios';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import MyNavbar from "./MyNavbar";

const ColourChangeScreen = ({ apiUrl }) => {
    const [colourList, setColourList] = useState([]);
    const [currentColour, setCurrentColour] = useState([255, 255, 255]);
    const [bgColor, setBgColor] = useState(`rgb(${currentColour})`);
    const [pointer, setPointer] = useState(0);
    const [qrSize, setQrSize] = useState(128); 
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight }); 
    const [isFullscreen, goFullscreen, exitFullscreen] = useFullscreen(); 
    const elementRef = useRef(null); 
    const [isStarted, setIsStarted] = useState(false); 

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

    useEffect(() => {
        window.addEventListener('resize', updateWindowDimensions);
        return () => window.removeEventListener('resize', updateWindowDimensions);
    }, []);

    useEffect(() => {
        if (isStarted && apiUrl) {
            axios.get(apiUrl)
                .then(res => {
                    if (Array.isArray(res.data)) {
                        setColourList(res.data);
                        console.log(res.data)
                    } else {
                        console.error("Data received is not an array");
                    }
                })
                .catch(err => {
                    console.error(err);
                    setColourList([[255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 255]]);
                });
        }
    }, [apiUrl, isStarted]); 

    useEffect(() => {
        if (colourList.length > 0 && colourList[pointer]) {
            setCurrentColour(colourList[pointer]);
            setBgColor(`rgb(${colourList[pointer]})`);
        }
    }, [pointer, colourList]);

    useEffect(() => {
        if (isStarted && colourList.length > 0) { 
            const intervalId = setInterval(() => {
              setPointer(pointer => {
                if (pointer + 1 >= colourList.length) {
                  setIsStarted(false); // Stop the color change
                  setBgColor('rgb(255, 255, 255)'); // Set the screen back to white
                  return 0; // Reset the pointer
                }

                return (pointer + 1);
              });
            }, 50);

            return () => clearInterval(intervalId);
        }
    }, [colourList.length, isStarted]); 

    let qrValue = JSON.stringify(currentColour);

    return (
        <div
            ref={elementRef}
            style={{
                backgroundColor: bgColor,
                height: isFullscreen ? '100%' : `${windowSize.height}px`,
                width: isFullscreen ? '100%' : `${windowSize.width}px`
            }}
        >
            <QRCode
                value={qrValue}
                size={qrSize}
                level={"H"}
                includeMargin={false}
                fgColour="#000000"
                bgColour="#FFFFFF"
                style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            />
            <input type="range" min="50" max="500" value={qrSize} onChange={(e) => setQrSize(parseInt(e.target.value))} style={{ position: 'fixed', bottom: '10%', left: '2%', width:'20vw' }} />
            <Button onClick={toggleFullscreen} style={{ position: 'fixed', right: '2%', bottom: '10%', fontSize: '1.5vw', marginRight: '1.5vw'}}>Toggle Fullscreen</Button>
            {!isStarted && 
                <div>
                    <MyNavbar></MyNavbar>
                    <Button 
                        onClick={() => { 
                            setIsStarted(true); 
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