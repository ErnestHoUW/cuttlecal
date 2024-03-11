import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { Link } from "react-router-dom";
import CuttleCal from "../images/cuttlecal_white.png"
import "../styles/MyNavbar.css";

export default function MyNavbar() {
  return (
    <Navbar bg="dark" variant="dark">
      <Navbar.Brand href="/" style={{ marginLeft: '20px', display: "flex", gap: '10px' }}>
          <img src={CuttleCal} style={{ "height":"30px" }} alt=""/>
          CuttleCal
      </Navbar.Brand>
      <Nav>
          <Nav.Link as={Link} to="/calibration">Calibration</Nav.Link>
          <Nav.Link as={Link} to="/upload">Upload</Nav.Link>
          <Nav.Link as={Link} to="/compare">Colour Compare</Nav.Link>
          <Nav.Link as={Link} to="/image">Image Compare</Nav.Link>
      </Nav>
    </Navbar>
  )
}