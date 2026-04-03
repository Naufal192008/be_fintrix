import { Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getStarted, lembarDua } from "../data/index";
import FooterComponent from "../components/FooterComponent";

const HomePage = () => {
  let navigate = useNavigate();
  return (
    <div className="homepage">
      <header className="w-100 min-vh-100 d-flex align-items-center pt-lg-5">
        <Container>
          <Row className="header-box d-flex align-items-center justify-content-center">
            <Col lg={6} md={12} className="text-center text-lg-start">
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
                <button className="btn-learn-more">Learn More</button>
              </div>
            </Col>

            <Col lg={6} md={10} sm={12} className="mt-5 mt-lg-0 d-flex justify-content-center">
              <div className="home-card shadow-lg p-4 w-100">
                <div className="d-flex justify-content-between align-items-center mb-4 text-start">
                  <div>
                    <p className="mb-1 text-label">Total Balance</p>
                    <h2 className="fw-bold text-white">$24,580.00</h2>
                  </div>
                </div>

                <hr className="border-secondary mb-4" />

                <Row className="text-start">
                  <Col xs={6}>
                    <div className="stat-box p-3 rounded-4">
                      <p className="mb-1 text-label">Income</p>
                      <h4 className="fw-bold text-white">$8,240</h4>
                      <span className="text-success small">+12.5%</span>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="stat-box p-3 rounded-4">
                      <p className="mb-1 text-label">Expenses</p>
                      <h4 className="fw-bold text-white">$3,680</h4>
                      <span className="text-danger small">-8.2%</span>
                    </div>
                  </Col>
                </Row>

                <div className="savings-box mt-4 p-3 rounded-4 text-start">
                  <div className="d-flex justify-content-between mb-2">
                    <p className="mb-0 text-label">Savings Goal</p>
                    <p className="small text-white mb-0">68%</p>
                  </div>

                  <div className="progress custom-progress-container">
                    <div
                      className="progress-bar custom-progress-bar"
                      role="progressbar"
                      aria-valuenow="68"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </header>

      {/* Section Lembar Dua */}
      <div className="lembar-dua w-100 min-vh-100">
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
            {lembarDua.map((hal2) => {
              return (
                <Col key={hal2.id} lg="4" md="6" sm="12">
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
      <div className="lembar-cara w-100">
        <Container>
          <Row className="mb-5">
            <Col>
              <h2 className="text-center fw-bold">
                Get Started in Three Simple Steps
              </h2>
            </Col>
          </Row>
          <Row>
            {getStarted.map((start) => {
              return (
                <Col key={start.id} lg="4" md="6" sm="12" className="text-center">
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