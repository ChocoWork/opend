import React, { useEffect, useState } from "react";
import logo from "../../assets/shop-window.svg";
import { BrowserRouter, Link, Switch, Route, NavLink } from "react-router-dom";
import homeImage from "../../assets/home-img.png";
import Minter from "./Minter";
import Gallery from "./Gallery";
import { opend } from "../../../declarations/opend";
import CURRENT_USER_ID from "../index";

function Header() {

  const [userOwnedGallary, setOwnedGallary] = useState();
  const [listingGallery, setListingGallery] = useState();

  async function getNFTs () {
    // TODO : CURRENT_USER_IDをログインしているIDに変更する
    // console.log("start getNFTs");
    const userNFTIds = await opend.getOwnedNFTs(CURRENT_USER_ID);
    // console.log("end getNFTs");
    // console.log(userNFTIds);
    setOwnedGallary(<Gallery title="Gallery" ids={userNFTIds} role="gallery" />);

    const listedNFTIds = await opend.getListedNFTs();
    console.log(listedNFTIds);
    setListingGallery(<Gallery title="Shop" ids={listedNFTIds} role="shop" />);
  }

  // このページが読み込まれたときにIDに紐づくNFTのリストを読み込む
  useEffect(() => {
    getNFTs();
  }, [])

  return (
    <BrowserRouter forceRefresh={true}>
      {/* <div className="app-root-1">
        <header className="Paper-root AppBar-root AppBar-positionStatic AppBar-colorPrimary Paper-elevation4">
          <div className="Toolbar-root Toolbar-regular header-appBar-13 Toolbar-gutters">
            <div className="header-left-4"></div>
            <img className="header-logo-11" src={logo} />
            <div className="header-vertical-9"></div>
            <Link to="/">
              <h5 className="Typography-root header-logo-text">OpenD</h5>
            </Link>
            <div className="header-empty-6"></div>
            <div className="header-space-8"></div>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/discover">Discover</Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/minter">Minter</Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
            <Link to="/collection">Collection</Link>
            </button>
          </div>
        </header>
      </div> */}
      <header className="p-3 ">
        <div className="container">
          <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
            <div className="header-left-4"></div>
          <Link to="/">
            <img src={logo} width="30" height="30" />
          </Link>
          <Link to="/">
            <h5 className="Typography-root header-logo-text text-dark" style={{ marginLeft: '10px', marginRight: '20px' }}>Stor</h5>
          </Link>
            <div className="header-vertical-9"></div>

            {/* <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
            <Link to="/gallery">
              <li><a href="#" className="nav-link px-2 text-dark">Gallery</a></li>
            </Link>
            <Link to="/shop">
              <li><a href="#" className="nav-link px-2 text-dark">Shop</a></li>
            </Link>
            <Link to="/lent">
              <li><a href="#" className="nav-link px-2 text-dark">Lent</a></li>
            </Link>
            <Link to="/create">
              <li><a href="#" className="nav-link px-2 text-dark">Create</a></li>
            </Link>
            </ul> */}

            <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
              <li>
                <NavLink to="/gallery" className="nav-link px-2 text-dark" activeClassName="box-with-line">Gallery</NavLink>
              </li>
              <li>
                <NavLink to="/shop" className="nav-link px-2 text-dark" activeClassName="box-with-line">Shop</NavLink>
              </li>
              <li>
                <NavLink to="/lent" className="nav-link px-2 text-dark" activeClassName="box-with-line">Lent</NavLink>
              </li>
              <li>
                <NavLink to="/create" className="nav-link px-2 text-dark" activeClassName="box-with-line">Create</NavLink>
              </li>
            </ul>

            <form className="col-12 col-lg-auto mb-3 mb-lg-0 me-lg-3" role="search">
              {/* <input type="search" className="form-control form-control-dark text-bg-secondary" placeholder="Search..." aria-label="Search" /> */}
              <input type="search" className="form-control  form-search" placeholder="Search..." aria-label="Search" />
            </form>

            <div className="text-end">
              <button type="button" className="btn me-2 btn-bg-gray">Login</button>
              {/* <button type="button" className="btn btn-dark">Register</button> */}
              <button type="button" className="btn btn-bg-black">Register</button>
            </div>
          </div>
        </div>
      </header>
      <Switch>
        <Route exact path="/">
          <p>HOME</p>
          {/* <img className="bottom-space" src={homeImage} /> */}
        </Route>
        <Route path="/gallery">
          {userOwnedGallary}
        </Route>
        <Route path="/shop">
          {listingGallery}
        </Route>
        <Route path="/create">
          <Minter />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default Header;
