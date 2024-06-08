import React, { useEffect, useState } from "react";
import Item from "./Item";
import { Principal } from "@dfinity/principal";

function Gallery(props) {

  const [items, setItems] = useState();
  const [selectedRadio, setSelectedRadio] = useState('btnradio1');
  const [selectedItem, setSelectedItem] = useState('All');
  const [dropDownMenu, setDropDownMenu] = useState();

  // IDの配列を読み込み各Itemをレンダリングする
  function fetchNFTs () {
    if (props.ids != undefined) {
      setItems(
        props.ids.map((NFTid) => (
          // 配列に対してmapメソッドを使用してレンダリングする場合はキープロパティを使用。keyは重複しなければよい
          <Item id={NFTid} key={NFTid.toText()} role={props.role} />
        ))
      )
    }

    if (props.role == "gallery") {
      setDropDownMenu(
        <div className="btn-group" role="group">
        <button type="button" className="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
          {selectedItem}
        </button>
        <ul className="dropdown-menu">
          <li><button className="dropdown-item" onClick={handleSelect}>All</button></li>
          <li><button className="dropdown-item" onClick={handleSelect}>On Sale</button></li>
          <li><button className="dropdown-item" onClick={handleSelect}>On Loan</button></li>
          <li><button className="dropdown-item" onClick={handleSelect}>Borrowed</button></li>
        </ul>
      </div>
      )
    }
  }

  // このページが読み込まれたときにIDの配列を読み込み各Itemをレンダリングする関数を実行する
  useEffect(() => {
    fetchNFTs();
  }, [])


  const handleChange = (event) => {
    setSelectedRadio(event.target.id);
  };

  const handleSelect = (event) => {
    setSelectedItem(event.target.textContent);
  };

  return (
    <div className="gallery-view">
      {/* <h3 className="makeStyles-title-99 Typography-h3">{props.title}</h3> */}
      <div className="btn-group" role="group" aria-label="Basic radio toggle button group">
        <input
          type="radio"
          className="btn-check"
          name="btnradio"
          id="btnradio1"
          autoComplete="off"
          checked={selectedRadio === 'btnradio1'}
          onChange={handleChange}
        />
        <label className="btn btn-outline-secondary" htmlFor="btnradio1">All</label>
        <input
          type="radio"
          className="btn-check"
          name="btnradio"
          id="btnradio2"
          autoComplete="off"
          checked={selectedRadio === 'btnradio2'}
          onChange={handleChange}
        />
        <label className="btn btn-outline-secondary" htmlFor="btnradio2">Art</label>

        <input
          type="radio"
          className="btn-check"
          name="btnradio"
          id="btnradio3"
          autoComplete="off"
          checked={selectedRadio === 'btnradio3'}
          onChange={handleChange}
        />
        <label className="btn btn-outline-secondary" htmlFor="btnradio3">Book</label>

        <input
          type="radio"
          className="btn-check"
          name="btnradio"
          id="btnradio4"
          autoComplete="off"
          checked={selectedRadio === 'btnradio4'}
          onChange={handleChange}
        />
        <label className="btn btn-outline-secondary" htmlFor="btnradio4">Music</label>

        <input
          type="radio"
          className="btn-check"
          name="btnradio"
          id="btnradio5"
          autoComplete="off"
          checked={selectedRadio === 'btnradio5'}
          onChange={handleChange}
        />
        <label className="btn btn-outline-secondary" htmlFor="btnradio5">Real Asset</label>
        {dropDownMenu}
      </div>

      <div className="disGrid-root disGrid-container disGrid-spacing-xs-2">
        <div className="disGrid-root disGrid-item disGrid-grid-xs-12">
          <div className="disGrid-root disGrid-container disGrid-spacing-xs-5 disGrid-justify-content-xs-center">
            {/* <Item id={"rrkah-fqaaa-aaaaa-aaaaq-cai"}/> */}
            {items}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Gallery;
