import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { Link } from "react-router-dom";
import CuttleCal from "../images/cuttlecal_white.png";

export default function MyNavbar() {

  const linkStyle = {
    color: 'inherit',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
  };

  const imageStyle = {
    height: "30px",
    paddingRight: "10px",
  };

  return (
    <Navbar bg="dark" variant="dark">
      <Navbar.Brand style={{ marginLeft: '20px', display: "flex", alignItems: 'center' }}>
        <Link to="/" style={linkStyle}> {}
          <img src={CuttleCal} style={imageStyle} alt=""/> {}
          CuttleCal
        </Link>
      </Navbar.Brand>
      <Nav className="align-items-center"> {/* Ensures that navigation links are also vertically centered */}
        <Nav.Link as={Link} to="/calibration" >Calibration</Nav.Link>
        <Nav.Link as={Link} to="/upload" >Upload</Nav.Link>
        <Nav.Link as={Link} to="/compare" >Colour Compare</Nav.Link>
        <Nav.Link as={Link} to="/image" >Image Compare</Nav.Link>
      </Nav>
    </Navbar>
  )
}
