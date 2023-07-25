


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
    origin: 'http://localhost:3000' // This is the React app's URL
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
let number = 100


app.get('/colors', (req, res) => {

  // for(let i = 0; i < 50; i++){
  //   colorsArray.push(generateRandomRGBColor());
  // }

  if (colorsArray.length === 0){
    res.status(500).json({ message: 'Bad Request' })
    return
  }
  console.log(colorsArray)
  res.status(200).json({number: number, colors: colorsArray});
  colorsArray = []
})

app.post('/addColors', (req, res) => {
  colorsArray.push(...req.body.colors)
  number = req.body.number

  res.status(200).json()
})

const readdirAsync = promisify(fs.readdir);
const unlinkAsync = promisify(fs.unlink);

app.get('/startCalibration', async (req, res) => {
  try {
    console.log("Starting binary");
    const folderName = 'measurements'; // Replace 'myFolder' with the desired folder name

    const files = await readdirAsync(folderName);

    for (const file of files) {
      await unlinkAsync(path.join(folderName, file));
    }

    const myCppBinaryProcess = spawn('cuttlecal.exe');
    myCppBinaryProcess.on('error', (err) => {
      console.error('Error while starting the binary:', err);
      res.status(500).json({ error: 'Internal server error' });
    });

    myCppBinaryProcess.on('exit', (code, signal) => {
      console.log(`Binary process exited with code ${code} and signal ${signal}`);
      // Perform any post-processing if necessary
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
