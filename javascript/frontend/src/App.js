import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ColourChangeScreen from './ColourChangeScreen';
import Home from './Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import GraphVisualizer from "./3DGraphVisualizer"

const App = () => {
  return (
    <Router>
      <Container fluid className="px-0">
        <Switch>
          <Route path="/" exact component={Home} />
          <Route 
            path="/colour-calibration" 
            render={(props) => (
              <ColourChangeScreen {...props} apiUrl="http://localhost:3000/colors" />
            )}
          />
          <Route 
            path="/3d-graph-visual" 
            render={(props) => (
              <GraphVisualizer {...props}/>
            )}
          />
        </Switch>
      </Container>
    </Router>
  )
}

export default App;