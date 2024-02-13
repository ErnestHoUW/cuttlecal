import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { Link } from "react-router-dom";
import "../styles/MyNavbar.css";

export default function MyNavbar() {
  return (
    <Navbar bg="dark" variant="dark">
      <Navbar.Brand href="/" style={{ marginLeft: '20px' }}>CuttleCal</Navbar.Brand>
      <Nav>
          <Nav.Link as={Link} to="/calibration">Calibration</Nav.Link>
          <Nav.Link as={Link} to="/upload">Upload</Nav.Link>
          <Nav.Link as={Link} to="/compare">Colour Compare</Nav.Link>
      </Nav>
    </Navbar>
  )
}