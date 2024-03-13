import React, { useState, useRef } from 'react';
import { Button, Upload } from 'antd';
import { ExpandOutlined } from '@ant-design/icons';
import { useInterpolationData } from '../InterpolationDataContext';


const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });



export default function ImageCompare() {
    const [uploadedFile, setUploadedFile] = useState('');
    const [previewImage, setPreviewImage] = useState('');
    const [adjustedImage, setAdjustedImage] = useState('');
    const [toAdd, setToAdd] = useState(true);
    const { interpolationData } = useInterpolationData();

    const [showLeft, setShowLeft] = useState(true);
    const [showRight, setShowRight] = useState(true);

    const generateNewImage = async (file) => {
        setUploadedFile(file)
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const image = new Image();
                image.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    canvas.width = image.width;
                    canvas.height = image.height;

                    // Apply red tint
                    ctx.drawImage(image, 0, 0);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    if (interpolationData) {
                        for (let i = 0; i < data.length; i += 4) {
                            // Extract RGB values
                            let red = data[i];
                            let green = data[i + 1];
                            let blue = data[i + 2];


                            // Update pixel values
                            if (toAdd) {
                                data[i] = Math.max(0, Math.min(255, red + interpolationData[red][green][blue][0]));
                                data[i + 1] = Math.max(0, Math.min(255, green + interpolationData[red][green][blue][1]));
                                data[i + 2] = Math.max(0, Math.min(255, blue + interpolationData[red][green][blue][2]));
                            }
                            else {
                                data[i] = Math.min(255, Math.max(0, red - interpolationData[red][green][blue][0]));
                                data[i + 1] = Math.min(255, Math.max(0, green - interpolationData[red][green][blue][1]));
                                data[i + 2] = Math.min(255, Math.max(0, blue - interpolationData[red][green][blue][2]));
                            }

                        }

                        // Put the modified image data back onto the canvas
                        ctx.putImageData(imageData, 0, 0);

                        resolve(canvas.toDataURL('image/jpeg'));
                    }
                };
                image.onerror = (error) => reject(error);
                image.src = reader.result;
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    }

    const previewWindowRef = useRef(null);
    const adjustedWindowRef = useRef(null);

    const openPreviewInNewWindow = () => {
        // Close the existing preview window if it's open
        if (previewWindowRef.current && !previewWindowRef.current.closed) {
            previewWindowRef.current.close();
        }

        if (previewImage) {
            const previewWindow = window.open();
            if (previewWindow) {
                previewWindow.document.write(`
                    <style>
                        body { margin: 0; overflow: hidden; display: flex; justify-content: center; align-items: center; width: 100vw; height: 100vh; }
                        img { width: 100%; height: 100%; object-fit: contain; }
                    </style>
                    <img src="${previewImage}" alt="Original Image">
                `);
                previewWindow.document.close(); // Ensure the document is fully written

                // Update the reference to the new window
                previewWindowRef.current = previewWindow;
            } else {
                alert('Unable to open the preview image in a new window. Please check your popup settings.');
            }
        }
    };

    const openAdjustedInNewWindow = () => {
        // Close the existing adjusted window if it's open
        if (adjustedWindowRef.current && !adjustedWindowRef.current.closed) {
            adjustedWindowRef.current.close();
        }

        if (adjustedImage) {
            const adjustedWindow = window.open();
            if (adjustedWindow) {
                adjustedWindow.document.write(`
                    <style>
                        body { margin: 0; overflow: hidden; display: flex; justify-content: center; align-items: center; width: 100vw; height: 100vh; }
                        img { width: 100%; height: 100%; object-fit: contain; }
                    </style>
                    <img src="${adjustedImage}" alt="Adjusted Image">
                `);
                adjustedWindow.document.close(); // Ensure the document is fully written

                // Update the reference to the new window
                adjustedWindowRef.current = adjustedWindow;
            } else {
                alert('Unable to open the adjusted image in a new window. Please check your popup settings.');
            }
        }
    };
    
    
    
    
    const handlePreview = async ({ file }) => {
        const filePreview = file.url || file.preview || await getBase64(file.originFileObj);
        setPreviewImage(filePreview);
        const newImage = await generateNewImage(file.originFileObj);
        setAdjustedImage(newImage);
    };

    return (
        <div className='panel' style={{ flexDirection: "column", flexGrow: 1, gap: "30px", padding: "50px" }}>
            <div style={{ display: "flex", flexGrow: 1, gap: "30px" }}>
                {previewImage && showLeft ? <img
                    style={{
                        height: '60vh',
                    }}
                    src={previewImage}
                    alt=""
                />
                    :
                    <div
                        style={{
                            height: '60vh',
                        }}
                    ></div>
                }
                {adjustedImage && showRight ? <img
                    style={{
                        height: '60vh',
                    }}
                    src={adjustedImage}
                    alt=""
                />
                    :
                    <div
                        style={{
                            height: '60vh',
                        }}
                    ></div>
                }
            </div>

            <div>{!interpolationData && "No JSON Found"}</div>
            <div style={{ display: "flex", flexGrow: 1, gap: "30px" }}>
                <Upload
                    action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                    onChange={handlePreview}
                >
                    <Button disabled={!interpolationData}>{"Upload"}</Button>
                </Upload>

                <Button onClick={async () => {
                    setToAdd(!toAdd)
                    setAdjustedImage(await generateNewImage(uploadedFile))
                }}
                    disabled={!interpolationData}
                > {toAdd ? "Subtract RGB Difference" : "Add RGB Difference"}
                </Button>
                <Button onClick={() => setShowLeft(!showLeft)}>{showLeft ? "Hide Left" : "Show Left"}</Button>
                <Button onClick={() => setShowRight(!showRight)}>{showRight ? "Hide Right" : "Show Right"}</Button>
                <Button onClick={openPreviewInNewWindow} disabled={!previewImage} icon={<ExpandOutlined />}>Pop Left</Button>
                <Button onClick={openAdjustedInNewWindow} disabled={!adjustedImage} icon={<ExpandOutlined />}>Pop Right</Button>
            </div>
        </div>
    );
};
