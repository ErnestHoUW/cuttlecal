const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

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

app.listen(port, () => {
  console.log(`Color API is running at http://localhost:${port}`);
})
