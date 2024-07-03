import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { idlFactory as tokenIdlFactory} from "../../../declarations/token";
import { Principal } from "@dfinity/principal";
import Button from "./Button";
import { opend } from "../../../declarations/opend";
import CURRENT_USER_ID from "../index";
import PriceLabel from "./PriceLabel";

function Item(props) {

  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [image, setImage] = useState();
  const [button, setButton] = useState();
  const [lentButton, setLentButton] = useState();
  const [priceInput, setPriceInput] = useState();
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [blur, setBlur] = useState();
  const [sellStatus, setSellStatus] = useState();
  const [priceLabel, setPriceLabel] = useState();
  const [shoudDisplay, setShoudDisplay] = useState(true);

  // NFTキャニスターIDをPrincipal IDに変換する
  // const id = Principal.fromText(props.id);
  const id = props.id;

  // NFTが格納されている箇所に対してHTTPリクエストを行い、情報を取得する
  // localhost上で動作させているのでlocalhostに対してリクエストを行う。本番環境だとICに対して行うのかな？
  const localHost = "http://localhost:8080";
  const agent = new HttpAgent({host: localHost}); // httpエージェントを作成する

  // ローカルでの作業時にInternet Computer上の公開鍵を使用した検証をスキップする
  // TODO : メインネットにデプロイする際はこの処理を削除する
  agent.fetchRootKey();
  
  let NFTActor;

  // 非同期関数loadNFTを定義します。この関数はNFTキャニスターをロードします。
  async function loadNFT() {
  // nft.did.jsファイルには、JavaScriptからNFTキャニスターのどのメソッドを呼び出すことができるかが記述されています。

  // Actor.createActorメソッドを使用して、NFTキャニスターのアクターを作成します。
  // idlFactoryは、キャニスターのインターフェース定義を提供します。
  // agentは、ネットワークリクエストを送信するためのエージェント（HTTPクライアントのようなもの）です。
  // canisterIdは、ロードするキャニスターの一意の識別子です。
    NFTActor = await Actor.createActor (idlFactory, {
      agent,
      canisterId: id,
    });

    const name = await NFTActor.getName();
    const owner = await NFTActor.getOwner();
    // TODO : 画像だけでなく、書籍、音楽等、さまざまな形式に対応させたい
    const imageData = await NFTActor.getAsset();
    const imageContent = new Uint8Array(imageData);
    const image = URL.createObjectURL(new Blob([imageContent], { type:"img/png" }))
    setName(name);
    setOwner(owner.toText());
    setImage(image);
    
    if (props.role == "gallery") {
      // 売却リストにNFTのキャニスターIDが存在している場合、Sellボタンを非表示にする
      console.log("Item props.id" + props.id);
      const nftIsListed = await opend.isListed(props.id);
      const openDId = await opend.getOpenDCanisterID(); // OpendのキャニスターIDを取得する
      if (nftIsListed) {
        setOwner("OpenD");
        setBlur({filter: "blur(4px)"}); // 画像にぼかしを入れる
        setSellStatus("Listed");
        // TODO : 貸出中と借りているかどうかを表示させる
      } else {
        setButton(<Button handleOnclick={handleSell} text={"Sell"} />);
        setLentButton(<Button handleOnclick={handleLent} text={"Lent"} />);
      }
    } else if (props.role == "shop") {
      const originalOwner = await opend.getOriginalOwner(props.id);
      if (originalOwner.toText() != CURRENT_USER_ID.toText()) {
        setButton(<Button handleOnclick={handleBuy} text={"Buy"} />);
      } else {
        setButton(<Button handleOnclick={handleUnlist} text={"Unlist"} />);
      }

      const price = await opend.getListedNFTsPrice(props.id);
      setPriceLabel(<PriceLabel sellPrice={price.toString()} />)
    }
  }

  useEffect(() => {
    loadNFT();
  }, []);

  let price;
  function handleSell() {
    setPriceInput(
      <input placeholder="Price in DANG" type="number" className="price-input" value={price} onChange={(e) => price = e.target.value} />
    )

    setButton(<Button handleOnclick={sellItem} text={"Confirm"} />);
  }

  async function sellItem() {
    setLoaderHidden(false);
    console.log("set price = " + price);
    // 売却リストに加える
    const listingResult = await opend.listItem(props.id, Number(price));
    console.log("listing: " + listingResult);
    if (listingResult == "Success") {
      const openDId = await opend.getOpenDCanisterID(); // OpendのキャニスターIDを取得する
      const transferResult = await NFTActor.transferOwnership(openDId); // 持ち主をOpendに変更する
      console.log("transferResult: " + transferResult);
      if (transferResult == "Success") {
        setBlur({filter: "blur(4px)"}); // 画像にぼかしを入れる
        setPriceInput();
        setButton();
        setOwner("OpenD");
        setSellStatus("Listed");
      }
    }
    setLoaderHidden(true);
  }

  async function handleBuy(params) {
    console.log("Buy was triggered");
    setLoaderHidden(false);
    // Tokenアクターにアクセスするための処理
    const tokenActor = await Actor.createActor(tokenIdlFactory, {
      agent,
      canisterId: Principal.fromText("wqmuk-5qaaa-aaaaa-aaaqq-cai"),
    });

    // NFTのPrincipalIDから売却者のIDとNFTの価格を取得する
    const sellerId = await opend.getOriginalOwner(props.id);
    const itemPrice = await opend.getListedNFTsPrice(props.id);

    const result = await tokenActor.transfer(sellerId, itemPrice);
    if (result == "Success") {
      // 代金を購入者から出品者に送金し、NFTのオーナーを変更する
      // TODO : CURRENT_USER_IDをログインしているユーザーに変更する
      console.log("completePurchase start");
      const transferResult = await opend.completePurchase(props.id, sellerId, CURRENT_USER_ID);
      console.log("purchase: " + transferResult);
      if (transferResult == "Success"){
        setShoudDisplay(false); // 購入が完了したら、購入画面のアイテムを非表示にする
      }
    }
    setLoaderHidden(true);
  }

  async function handleUnlist() {
    console.log("Unlist was triggered");
    setLoaderHidden(false);
    const unlistResutl = await opend.unlistItem(props.id);
    if (unlistResutl == "Success") {
      setShoudDisplay(false); // 売却キャンセルが完了したら、購入画面のアイテムを非表示にする
    } else {
      console.log("unlistResutl: " + unlistResutl);
    }
  }

  async function handleLent() {
    
  }

  return (
    <div style={{display: shoudDisplay ? "inline" : "none"}} className="disGrid-item">
      {/* <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded card-style">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img card-style"
          src={image}
          style={blur}
        />
        <div hidden={loaderHidden} className="lds-ellipsis">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div> */}
        {/* <div className="disCardContent-root">
          {priceLabel}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text"> {sellStatus}</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          {priceInput}
          {button}
        </div> */}
        {/* <div className="disCardContent-root">
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text"> {sellStatus}</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          {priceLabel}
          {priceInput}
          {button}
        </div>
      </div> */}

      <div className="card card-style">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
          />
        <div className="card-body">
          {/* TODO : ローダーはボタンと一体化させた方がよさそう */}
          <div hidden={loaderHidden} className="lds-ellipsis">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text"> {sellStatus}</span>
          </p>
          {priceLabel}
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            {/* TODO : クリエイターと企業名をOwnerの部分に入れる */}
            Owner: {owner}
            {/* クリエイターと企業名 */}
          </p>
          {priceInput}
          {button}
          {lentButton}
          {/* <a href="#" className="btn btn-secondary">Go somewhere</a> */}
        </div>
      </div>

    </div>
  );
}

export default Item;
