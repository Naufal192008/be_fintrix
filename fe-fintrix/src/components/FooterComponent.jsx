import { Row, Col, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

const FooterComponent = () => {
  return (
    <div className="footer py-5">
      <Container>
        <Row className="justify-content-between align-items-start">
          <Col xs="auto">
            <h3 className="fw-bold">FINTRIX</h3>
          </Col>
          <Col xs="auto" className="footer-links">
            <Link to="">About</Link>
            <Link to="">Features</Link>
            <Link to="">Pricing</Link>
            <Link to="">Contact</Link>
          </Col>
        </Row>

        <hr />

        <Row className="justify-content-between">
          <Col xs="auto" className="mt-3">
            <p>&copy; {new Date().getFullYear()} Fintrix. All rights reserved.</p>
          </Col>
          <Col xs="auto">
          <div className="social mt-3">
            <Link to="">
              <i className="fa-brands fa-github"></i>
               </Link>
               <Link to="">
              <i className="fa-brands fa-twitter"></i>
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default FooterComponent;
