import React, { useEffect, useState } from "react";
import logo from "../../assets/shop-window.svg";
import login from "../../assets/login.svg";
import profile from "../../assets/profile.svg";
import wallet from "../../assets/wallet.svg";
import { BrowserRouter, Link, Switch, Route, NavLink } from "react-router-dom";
import Minter from "./Minter";
import Gallery from "./Gallery";
import { opend } from "../../../declarations/opend";
import { useUserId } from './UserIdContext';

function Header() {

  const [userOwnedGallary, setOwnedGallary] = useState();
  const [listingGallery, setListingGallery] = useState();
  const [lendingGallery, setLendingGallery] = useState();
  const { userId, handleLogin } = useUserId();

  async function getNFTs () {
    // --- Gallery ---
    const userNFTIds = await opend.getOwnedNFTs(userId);
    setOwnedGallary(<Gallery ids={userNFTIds} role="gallery" />);

    // --- Listing ---
    const listedNFTIds = await opend.getListedNFTs();
    console.log(listedNFTIds);
    setListingGallery(<Gallery ids={listedNFTIds} role="shop" />);

    // --- Rending ---
    const lentNFTIds = await opend.getRentNFTs();
    console.log(lentNFTIds);
    setLendingGallery(<Gallery ids={lentNFTIds} role="lent" />);
  }

  // このページが読み込まれたときにIDに紐づくNFTのリストを読み込む
  useEffect(() => {
    if (userId) {
      getNFTs();
    }
  }, [userId]);

  return (
    <BrowserRouter forceRefresh={true}>
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
            <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
              <li>
                <NavLink to="/gallery" className="nav-link px-2 text-dark" activeClassName="box-with-line">Gallery</NavLink>
              </li>
              <li>
                <NavLink to="/shop" className="nav-link px-2 text-dark" activeClassName="box-with-line">Shop</NavLink>
              </li>
              <li>
                <NavLink to="/lent" className="nav-link px-2 text-dark" activeClassName="box-with-line">Rent</NavLink>
              </li>
              <li>
                <NavLink to="/create" className="nav-link px-2 text-dark" activeClassName="box-with-line">Create</NavLink>
              </li>
            </ul>
            <form className="col-12 col-lg-auto mb-3 mb-lg-0 me-lg-3" role="search">
              <input type="search" className="form-control  form-search" placeholder="Search..." aria-label="Search" />
            </form>

            <div className="text-end">
              {userId ? (
                <>
                  {/* TODO:ログインしたらつないでいるウォレットの残高を表示できるようにする */}
                  <button type="button" className="btn me-2 btn-bg-gray" onClick={handleLogin}>
                    <img src={wallet} /> Wallet
                  </button>
                  <button type="button" className="btn me-2 btn-bg-gray">
                    <img src={profile} width="20" height="20" />
                </button>
                </>
              ) : (
                <>
                  <button type="button" className="btn me-2 btn-bg-gray" onClick={handleLogin}>
                    <img src={login} /> Login
                  </button>
                  <button type="button" className="btn btn-secondary">
                    <a href="https://identity.internetcomputer.org/" target="_blank" rel="noopener noreferrer">Register</a>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      <Switch>
        <Route exact path="/">
          <p>HOME</p>
          {/* HOMEには人気の漫画、人気の書籍、人気の物などを掲載する */}
        </Route>
        <Route path="/gallery">
          {userOwnedGallary}
        </Route>
        <Route path="/shop">
          {listingGallery}
        </Route>
        <Route path="/lent">
          {lendingGallery}
        </Route>
        <Route path="/create">
          <Minter />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default Header;