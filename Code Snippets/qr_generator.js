import React from 'react';
import { Container, Row, Col, ListGroup, Form } from 'react-bootstrap';

const WebcamShroudSetup = () => {
  return (
    <Container className="mt-4">
      <Row className="justify-content-md-center">
        <Col md="8">
          <h1 className="text-center mb-4">Webcam Shroud Setup</h1>
          <ListGroup variant="flush">
            <ListGroup.Item className="d-flex justify-content-between align-items-center">
              <div>
                <h5>Step 1:</h5>
                <p>Identify the correct webcam and ensure it is properly connected to your device.</p>
              </div>
              <Form.Check aria-label="option 1" className="form-check-inline mb-2"/>
            </ListGroup.Item>
          </ListGroup>
        </Col>
      </Row>
    </Container>
  );
};

export default WebcamShroudSetup;