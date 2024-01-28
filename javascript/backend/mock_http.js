


const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { spawn } = require('child_process');

app.use(express.json());

// Allow cross-origin requests
app.use(cors({
    origin: '*' // This is the React app's URL
}));

// Function to generate random RGB color
const generateRandomRGBColor = () => {
  return [
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256)
  ];
}

let colorsArray = []
let frameLength = 200


app.get('/colors', (req, res) => {

  // for(let i = 0; i < 50; i++){
  //   colorsArray.push(generateRandomRGBColor());
  // }

  if (colorsArray.length === 0){
    res.status(200).json({ message: 'No Colors Yet' })
    return
  }
  console.log(colorsArray)
  res.status(200).json({frame_length: frameLength, colors: colorsArray});
  colorsArray = []
})

app.post('/addColors', (req, res) => {
  console.log(req.body.colors)
  console.log(req.body.frame_length)
  colorsArray.push(...req.body.colors)
  frameLength = req.body.frame_length

  res.status(200).json()
})

const readdirAsync = promisify(fs.readdir);
const unlinkAsync = promisify(fs.unlink);

let currentCalibrationProcess = null;

// Function to terminate the process and wait for it to exit
const terminateProcess = (process) => {
  return new Promise((resolve, reject) => {
    if (!process) {
      resolve(); // If there's no process, resolve immediately
      return;
    }

    process.on('exit', () => {
      console.log(`Process terminated.`);
      resolve(); // Resolve the promise when the process exits
    });
    process.on('error', (err) => {
      console.error('Error while terminating the process:', err);
      reject(err); // Reject the promise if there's an error
    });

    process.kill(); // Send SIGTERM signal to terminate the process
  });
};

app.get('/startCalibration', async (req, res) => {
  try {
    console.log("Starting binary");
    const folderName = 'measurements';

    // Check if the folder exists, create it if it doesn't
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName, { recursive: true });
    }

    const files = await readdirAsync(folderName);

    for (const file of files) {
      await unlinkAsync(path.join(folderName, file));
    }

    // Await the termination of the current process if it exists
    if (currentCalibrationProcess) {
      console.log("Terminating existing cuttlecal.exe process");
      await terminateProcess(currentCalibrationProcess); // Wait for the process to terminate
    }

    const cuttlecalPath = path.join('javascript', 'backend', 'calibrator', 'cuttlecal.exe');
    
    // Start a new process
    currentCalibrationProcess = spawn(cuttlecalPath);
    
    currentCalibrationProcess.on('error', (err) => {
      console.error('Error while starting the binary:', err);
      res.status(500).json({ error: 'Internal server error' });
    });

    currentCalibrationProcess.on('exit', (code, signal) => {
      console.log(`Binary process exited with code ${code} and signal ${signal}`);
      currentCalibrationProcess = null; // Reset the reference when the process exits
    });

    res.status(200).json({ message: 'Calibration started successfully' });
  } catch (err) {
    console.error('Error while starting calibration:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(port, () => {
  console.log(`Color API is running at http://localhost:${port}`);
})
