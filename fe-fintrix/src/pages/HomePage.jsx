import { Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getStarted, lembarDua } from "../data/index";
import FooterComponent from "../components/FooterComponent";
import grafikkk from "../assets/grafikkk.jpg";

const HomePage = () => {
  let navigate = useNavigate();
  return (
    <div className="homepage">
      <header className="w-100 min-vh-100 d-flex align-items-center pt-lg-5">
        <Container>
          <Row className="header-box d-flex align-items-center justify-content-center">
            <Col lg={6} md={12} className="text-center text-lg-start" data-aos="fade-up">
              <h1 className="fw-bold">
                Control <br />
                Your <span>Money</span> <br />
                Own Your Future
              </h1>
              <p className="mb-4">
                Track income, monitor expense, and build smarter financial{" "}
                <br className="d-none d-lg-block" />
                habits with Fintrix.
              </p>
              <div className="d-flex gap-3 flex-column flex-md-row justify-content-center justify-content-lg-start">
                <button
                  onClick={() => navigate("/login")}
                  className="btn-get-started"
                >
                  Get Started
                </button>
                <a href="#how-it-works" className="btn-learn-more text-decoration-none d-flex align-items-center justify-content-center">Learn More</a>
              </div>
            </Col>

            <Col lg={6} md={12} className="mt-5 mt-lg-0 d-flex justify-content-center" data-aos="fade-left">
              <img src={grafikkk} alt="Dashboard Overview" className="img-fluid rounded-4 shadow-lg" />
            </Col>
          </Row>
        </Container>
      </header>

      {/* Section Lembar Dua */}
      <div className="lembar-dua w-100 min-vh-100" id="how-it-works">
        <Container>
          <Row>
            <Col>
              <h2 className="text-center fw-bold">
                Everything you need to manage your finances
              </h2>
              <p className="text-center">
                Simple, powerful tools to help you take control of your
                financial future.
              </p>
            </Col>
          </Row>
          <Row className="justify-content-start g-4">
            {lembarDua.map((hal2, index) => {
              return (
                <Col key={hal2.id} lg="4" md="6" sm="12" data-aos="fade-up" data-aos-delay={index * 100}>
                  <div className="shadow-rounded">
                    <img src={hal2.image} alt={hal2.judul} className="mb-3" />
                    <div className="hal2">
                      <h5 className="mb-3 fw-bold">{hal2.judul}</h5>
                      <p className="mb-4">{hal2.paragraf}</p>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </Container>
      </div>

      {/* Section Lembar Cara */}
      <div className="lembar-cara w-100" id="getting-started">
        <Container>
          <Row className="mb-5">
            <Col>
              <h2 className="text-center fw-bold">
                Get Started in Three Simple Steps
              </h2>
            </Col>
          </Row>
          <Row>
            {getStarted.map((start, index) => {
              return (
                <Col key={start.id} lg="4" md="6" sm="12" className="text-center" data-aos="zoom-in" data-aos-delay={index * 150}>
                  <img
                    src={start.image}
                    alt="number"
                    className="mb-3 mx-auto d-block"
                  />
                  <h5 className="mb-3 fw-bold">{start.judul}</h5>
                  <p className="mb-4">{start.paragraf}</p>
                </Col>
              );
            })}
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default HomePage;