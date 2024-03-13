import React, { useState, useRef, useEffect } from 'react';
import { Button, Upload, Tour } from 'antd';
import { QuestionCircleOutlined, ExpandOutlined } from '@ant-design/icons';
import { useInterpolationData } from '../InterpolationDataContext';
import DefaultImage from '../images/oceanandfish.jpg';

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
    const [open, setOpen] = useState(false);

    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const ref3 = useRef(null);
    const ref4 = useRef(null);
    const ref5 = useRef(null);
    const ref6 = useRef(null);
    const ref7 = useRef(null);

    useEffect(() => {
        async function bruh() {
            if (interpolationData) {
                const response = await fetch(DefaultImage);
                const blob = await response.blob();
                
                setPreviewImage(DefaultImage);
                const newImage = await generateNewImage(blob);
                setAdjustedImage(newImage);
            }
        }
        bruh();
    }, [])

    const steps = [
        {
            title: "Image Compare Page Overview",
            description: "This Image Compare page displays a image in your current monitor versus that same image in a different monitor, based on the JSON document you uploaded in the Upload Page.",
            target: () => ref1.current
        },
        {
            title: "Your Monitor's Colors",
            description: "The left side of the screen shows the image for your monitor.",
            placement: "left",
            target: () => ref2.current
        },
        {
            title: "Other Monitor's Colors",
            description: "The right side of the screen displays the image other monitor.",
            placement: "right",
            target: () => ref3.current
        },
        {
            title: "Image Upload",
            description: "Use this to upload your image to be compared",
            target: () => ref5.current
        },
        {
            title: "Subtract/Add RGB Difference",
            description: "Use this button to adjust the difference between the monitors' colors at that color.",
            placement: "bottom",
            target: () => ref4.current
        },
        {
            title: "Show/Hide Images",
            description: "Use these buttons to show or hide the left/right images",
            target: () => ref6.current
        },
        {
            title: "Pop Images",
            description: "Use these buttons to open the left/right image in another tab",
            target: () => ref7.current
        }
    ]

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
                        // height: '60vh',
                        width: '49vw',
                    }}
                    src={previewImage}
                    alt=""
                    ref={ref2}
                />
                    :
                    <div
                        style={{
                            height: '60vh',
                            width: '48vw'
                        }}
                        ref={ref2}
                    ></div>
                }
                {adjustedImage && showRight ? <img
                    style={{
                        // height: '60vh',
                        width: '49vw',
                    }}
                    src={adjustedImage}
                    alt=""
                    ref={ref3}
                />
                    :
                    <div
                        style={{
                            height: '60vh',
                            width: '48vw'
                        }}
                        ref={ref3}
                    ></div>
                }
            </div>

            <div>{!interpolationData && "No JSON Found"}</div>
            <div style={{ display: "flex" }}>
                <Upload
                    action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                    onChange={handlePreview}
                    showUploadList={false}
                >
                    <Button style={{ marginRight: "15px" }} ref={ref5} disabled={!interpolationData}>{"Upload"}</Button>
                </Upload>
                <Button onClick={async () => {
                    setToAdd(!toAdd)
                    setAdjustedImage(await generateNewImage(uploadedFile))
                }}
                    ref={ref4}
                    disabled={!interpolationData}
                    style={{ marginRight: "15px" }}
                > {toAdd ? "Subtract RGB Difference" : "Add RGB Difference"}
                </Button>
                <div ref={ref6}>
                    <Button style={{ marginRight: "15px" }} onClick={() => setShowLeft(!showLeft)}>{showLeft ? "Hide Left" : "Show Left"}</Button>
                    <Button style={{ marginRight: "15px" }} onClick={() => setShowRight(!showRight)}>{showRight ? "Hide Right" : "Show Right"}</Button>
                </div>
                <div ref={ref7}>
                    <Button style={{ marginRight: "15px" }} onClick={openPreviewInNewWindow} disabled={!previewImage} icon={<ExpandOutlined />}>Pop Left</Button>
                    <Button style={{ marginRight: "15px" }} onClick={openAdjustedInNewWindow} disabled={!adjustedImage} icon={<ExpandOutlined />}>Pop Right</Button>
                </div>
                <Button icon={<QuestionCircleOutlined />} type="default"
                    onClick={() => setOpen(true)}
                >
                </Button>
            </div>

            <Tour open={open} onClose={() => setOpen(false)} steps={steps} />
        </div>
    );
};
