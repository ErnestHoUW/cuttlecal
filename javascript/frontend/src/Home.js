import React from 'react';
import logo from './images/logo.png';
import { Container } from 'react-bootstrap';
import MyNavbar from './MyNavbar';

const Home = () => {
    return (
        <Container fluid className="px-0">
            <MyNavbar></MyNavbar>
            <Container className="d-flex flex-column justify-content-center align-items-center vh-100">
                <img src={logo} alt="Logo" style={{ width: '150px', marginBottom: '20px' }}/>
                <h1>Welcome to CuttleCal</h1>
            </Container>
        </Container>
    );
};

export default Home