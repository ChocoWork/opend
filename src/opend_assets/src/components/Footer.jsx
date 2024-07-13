import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Xlogo from "../../assets/x.png";
import Instalogo from "../../assets/instagram.svg";
import Discordlogo from "../../assets/discord.svg";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer>
      <div class="container">
        <ul class="nav justify-content-start list-unstyled d-flex py-4 border-top border-bottom">
          <li class="ms-3"><a class="text-body-secondary" href="#"></a><img src={Xlogo} width="35" height="35" /></li>
          <li class="ms-3"><a class="text-body-secondary" href="#"></a><img src={Instalogo} width="35" height="35" /></li>
          <li class="ms-3"><a class="text-body-secondary" href="#"></a><img src={Discordlogo} width="35" height="35" /></li>
        </ul>

        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-5 py-5 justify-content-center text-start">
          <div class="col-md-4 mb-3">
            <h4 class="text-dark ">Stor</h4>
            <p class="text-body-secondary">手に届くものの正しさを証明。クリエイターを守り、リアルとデジタルのシームレスな社会へ。</p>
          </div>

          {/* <div class="col mb-3">

          </div> */}

          <div class="col mb-3">
            <h5 class="text-dark">Service</h5>
            <ul class="nav flex-column">
              <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-body-secondary">Gallery</a></li>
              <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-body-secondary">Shop</a></li>
              <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-body-secondary">Rent</a></li>
              <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-body-secondary">Create</a></li>
            </ul>
          </div>

          <div class="col mb-3">
            <h5 class="text-dark">Category</h5>
            <ul class="nav flex-column">
              <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-body-secondary">Art</a></li>
              <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-body-secondary">Book</a></li>
              <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-body-secondary">Music</a></li>
              <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-body-secondary">Real Asset</a></li>
            </ul>
          </div>

          <div class="col mb-3">
            <h5 class="text-dark">Section</h5>
            <ul class="nav flex-column">
              <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-body-secondary">Home</a></li>
              <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-body-secondary">Features</a></li>
              <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-body-secondary">Pricing</a></li>
              <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-body-secondary">FAQs</a></li>
              <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-body-secondary">About</a></li>
            </ul>
          </div>
        </div>
        <div class="d-flex flex-wrap justify-content-between align-items-center py-3 border-top">
          <div class="col-md-4 d-flex align-items-center">
            <a href="/" class="mb-3 me-2 mb-md-0 text-body-secondary text-decoration-none lh-1">
              <svg class="bi" width="30" height="24"><use xlink:href="#bootstrap"></use></svg>
            </a>
            <span class="mb-3 mb-md-0 text-body-secondary">© 2024 - {year} Heritage, Inc </span>
          </div>

          <ul class="nav col-md-4 justify-content-end list-unstyled d-flex">
            <li class="ms-3"><a class="text-body-secondary" href="#"><svg class="bi" width="24" height="24"><use xlink:href="#twitter"></use></svg></a></li>
            <li class="ms-3"><a class="text-body-secondary" href="#"><svg class="bi" width="24" height="24"><use xlink:href="#instagram"></use></svg></a></li>
            <li class="ms-3"><a class="text-body-secondary" href="#"><svg class="bi" width="24" height="24"><use xlink:href="#facebook"></use></svg></a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
