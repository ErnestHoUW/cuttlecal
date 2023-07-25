import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ColourChangeScreen from './ColourChangeScreen';
import Home from './Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import GraphVisualizer from "./3DGraphVisualizer"

const current_ip = window.location.host.split(":")[0];
console.log(current_ip);

const App = () => {
  return (
    <Router>
      <Container fluid className="px-0">
        <Switch>
          <Route path="/" exact component={Home} />
          <Route 
            path="/colour-calibration" 
            render={(props) => (
              <ColourChangeScreen {...props} apiUrl={`http://${current_ip}:3001`} />
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