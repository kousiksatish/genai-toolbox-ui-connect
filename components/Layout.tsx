
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Container fluid>
      <Row>
        <Col as="header">
          <h1 className="mt-3">Welcome to the GenAI Toolbox UI</h1>
        </Col>
      </Row>
      <Row>
        <Col as="main" className="ms-sm-auto px-md-4 py-4">
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default Layout;
