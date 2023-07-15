const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Allow cross-origin requests
app.use(cors({
    origin: 'http://localhost:3001' // This is the React app's URL
}));

// Function to generate random RGB color
const generateRandomRGBColor = () => {
  return [
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256)
  ];
}

app.get('/colors', (req, res) => {
  let colorsArray = [];
  
  for(let i = 0; i < 500; i++){
    colorsArray.push(generateRandomRGBColor());
  }

  res.json(colorsArray);
})

app.listen(port, () => {
  console.log(`Color API is running at http://localhost:${port}`);
})