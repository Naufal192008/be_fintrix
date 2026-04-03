import {Navbar, Container, Nav} from 'react-bootstrap'
import {NavLink} from 'react-router-dom'
import {navLinks} from '../data/index'
import {useNavigate} from 'react-router-dom'
import {useState, useEffect} from 'react'



const NavBarComponent = () => {
  let navigate = useNavigate();
  const [changeColor, setChangeColor] = useState(false)

  
  useEffect(() => {
    const changeBackgroundColor = () => {
    if(window.scrollY > 10) {
      setChangeColor(true)
    }else {
      setChangeColor(false)
    }
  };
  
    changeBackgroundColor();
    window.addEventListener("scroll", changeBackgroundColor)
    
    return () => {
      window.removeEventListener("scroll", changeBackgroundColor);
    };
  },[]);

  return (
    <div>
      <Navbar expand="lg" className={changeColor ? "color-active" : ""}>
        <Container>
          <Navbar.Brand href="#home" className="fs-3 fw-bold text-white">Fintrix</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto text-center align-items-center">
              {navLinks.map((link) => {
                return (
                  <div className="nav-link" key={link.id}>
                    <NavLink
                      to={link.path}
                      className={({ isActive, isPending }) =>
                        isPending ? "pending" : isActive ? "active" : ""
                      }
                      end
                    >
                      {link.title}
                    </NavLink>
                  </div>
                );
              })}
               <div className='text-center' onClick={() => navigate("/login")}>
              <button className='btn-get-started ms-lg-3'>Get Started</button>
            </div>
            </Nav>
           
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default NavBarComponent;
