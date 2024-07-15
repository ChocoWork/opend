import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { idlFactory as tokenIdlFactory} from "../../../declarations/token";
import { Principal } from "@dfinity/principal";
import Button from "./Button";
import { opend } from "../../../declarations/opend";
import PriceLabel from "./PriceLabel";
import { useUserId } from './UserIdContext';

function Item(props) {

  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [image, setImage] = useState();
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] = useState();
  const [lentButton, setLentButton] = useState();
  const [rentButton, setRentButton] = useState();
  const [lentFirstInput, setLentFirstInput] = useState();
  const [lentPeriod, setLentPeriod] = useState();
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [blur, setBlur] = useState();
  const [sellStatus, setSellStatus] = useState();
  const [priceLabel, setPriceLabel] = useState();
  const [shoudDisplay, setShoudDisplay] = useState(true);

  const { userId } = useUserId();

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
      const nftIsLent = await opend.isLent(props.id);
      const nftIsRent = await opend.isRent(props.id);
      const openDId = await opend.getOpenDCanisterID(); // OpendのキャニスターIDを取得する
      if (nftIsListed) {
        setOwner("OpenD");
        setBlur({filter: "blur(4px)"}); // 画像にぼかしを入れる
        setSellStatus("Listed");
        // TODO : 貸出中と借りているかどうかを表示させる
      } else if (nftIsLent) {
        const nftLentAdmin = await opend.getLentItemOriginalAdmin(props.id);
        if (nftLentAdmin.toText() == userId) {
          setBlur({filter: "blur(4px)"}); // 画像にぼかしを入れる
          setSellStatus("Lent");
        } else {
          setSellStatus("Borrowed");
          setButton(<Button handleOnclick={handleReturnLent} text={"Return"} />);
        }
      } else if (nftIsRent) {
        const nftRentAdmin = await opend.getRentItemOriginalAdmin(props.id);
        console.log("nftRentAdmin: " + nftRentAdmin.toText());
        console.log("userId: " + userId);
        if (nftRentAdmin.toText() == userId) {
          setBlur({filter: "blur(4px)"}); // 画像にぼかしを入れる
          setSellStatus("Lent");
        } else {
          setSellStatus("Borrowed");
          setButton(<Button handleOnclick={handleReturnRent} text={"Return"} />);
        }
      }else {
        setButton(<Button handleOnclick={handleSell} text={"Sell"} />);
        setLentButton(<Button handleOnclick={handleLent} text={"Lent"} />);
      }
    } else if (props.role == "shop") {
      const originalOwner = await opend.getOriginalOwner(props.id);
      if (originalOwner.toText() != userId.toText()) {
        setButton(<Button handleOnclick={handleBuy} text={"Buy"} />);
      } else {
        setButton(<Button handleOnclick={handleUnlist} text={"Unlist"} />);
      }

      const price = await opend.getListedNFTsPrice(props.id);
      setPriceLabel(<PriceLabel sellPrice={price.toString()} />)
    } else if ( props.role == "lent") {
      const RentItemOriginalAdmin = await opend.getRentItemOriginalAdmin(props.id);
      if (RentItemOriginalAdmin.toText() == userId.toText()) {
        setButton(<Button handleOnclick={handleWithdraw} text={"Withdraw"} />);
      } else {
        if (owner.toText() == userId.toText()) {
          setBlur({filter: "blur(4px)"}); // 画像にぼかしを入れる
        } else {
          setButton(<Button handleOnclick={handleBorrow} text={"Borrow"} />);
        }
      }
    }
  }

  useEffect(() => {
    loadNFT();
  }, []);

  // --- Sell ---
  let price;
  function handleSell() {
    setPriceInput(<input placeholder="Price in DANG" type="number" className="price-input" value={price} onChange={(e) => price = e.target.value} />);

    setButton(<Button handleOnclick={sellItem} text={"Confirm"} />);
    setLentButton();
  }

  async function sellItem() {
    setLoaderHidden(false);
    console.log("set price = " + price);
    const listingResult = await opend.listItem(props.id, Number(price)); // 売却リストに加える props.id:6xkho-mqaaa-aaaaa-aabgq-cai
    console.log("listing: " + listingResult);
    if (listingResult == "Success") {
      const openDId = await opend.getOpenDCanisterID(); // OpendのキャニスターIDを取得する
      const transferResult = await NFTActor.transferOwnership(openDId, "sell"); // 持ち主をOpendに変更する
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

  // --- Lent ---
  let lentFirstVal;
  let period;
  function handleLent() {
    // TODO : 友人に貸し出す機能を付ける
    // TODO : Lentボタンをおしたら、友人に貸出と有料で貸し出しの選択肢を表示させる
    // 「Lend to a Friend」（友人に貸し出す）と「Lend for a Fee」（有料で貸し出す）
    setButton();
    setLentButton(<Button handleOnclick={handleLentItem} text={"Lend to a Friend"} />);
    setRentButton(<Button handleOnclick={handleRentItem} text={"Lend for a Fee"} />);
  }

  function handleLentItem() {
    setLentFirstInput(<input placeholder="Friend's ID" type="text" className="price-input" value={lentFirstVal} onChange={(e) => lentFirstVal = e.target.value} />);
    setLentPeriod(<input placeholder="Lent Period" type="number" className="price-input" value={period} onChange={(e) => period = e.target.value} />);
    setLentButton(<Button handleOnclick={lentItem} text={"Confirm"} />);
    setRentButton();
  }
  
  function handleRentItem() {
    setLentFirstInput(<input placeholder="Rental Fee" type="number" className="price-input" value={lentFirstVal} onChange={(e) => lentFirstVal = e.target.value} />);
    setLentPeriod(<input placeholder="Lent Period" type="number" className="price-input" value={period} onChange={(e) => period = e.target.value} />);
    setLentButton();
    setRentButton(<Button handleOnclick={rentItem} text={"Confirm"} />);
  }
  
  // 友人に貸し出す
  async function lentItem() {
    setLoaderHidden(false);
    const lentDate = Date.now(); // 現在の日付を取得します
    const dueDate = lentDate + (24 * 60 * 60 * 1000 * period); // 現在の1日分のミリ秒

    const lendingResult = await opend.lentItem(props.id, Principal.fromText(lentFirstVal), dueDate); // 貸出リスト(友人)に追加する
    console.log("lendingResult: " + lendingResult);
    if (lendingResult == "Success") {
      const transferResult = await NFTActor.transferOwnership(Principal.fromText(lentFirstVal), "lent"); // 持ち主をOpendに変更する
      console.log("transferResult: " + transferResult);
      if (transferResult == "Success") {
        setBlur({filter: "blur(4px)"}); // 画像にぼかしを入れる
        setLentFirstInput();
        setLentPeriod();
        setLentButton();
        setOwner(lentFirstVal);
        setSellStatus("Lent");
      }
    }
    setLoaderHidden(true);
  }
  
  // 有料で貸し出す
  async function rentItem() {
    console.log("rentItem");
    setLoaderHidden(false);
    const lentDate = Date.now(); // 現在の日付を取得します
    const dueDate = lentDate + (24 * 60 * 60 * 1000 * period); // 現在の1日分のミリ秒
    let natLentFirstVal = Math.round(lentFirstVal);
    const rendingResult = await opend.rentItem(props.id, natLentFirstVal, dueDate); // 売却リストに加える
    console.log(dueDate) // Debug

    if (rendingResult == "Success") {
      const openDId = await opend.getOpenDCanisterID(); // OpendのキャニスターIDを取得する
      const transferResult = await NFTActor.transferOwnership(openDId, "rent"); // 持ち主をOpendに変更する
      if (transferResult == "Success") {
        setBlur({filter: "blur(4px)"}); // 画像にぼかしを入れる
        setLentFirstInput();
        setLentPeriod();
        setRentButton();
        setOwner("OpenD");
        setSellStatus("Lent");
      }
    }
    setLoaderHidden(true);
  }
  
  // --- Borrow ---
  async function handleBorrow() {
    setLoaderHidden(false);
    // Tokenアクターにアクセスするための処理
    const tokenActor = await Actor.createActor(tokenIdlFactory, {
      agent,
      canisterId: Principal.fromText("wqmuk-5qaaa-aaaaa-aaaqq-cai"),
    });

    const lenderId = await opend.getRentItemOriginalAdmin(props.id);
    const rentalPrice = await opend.getRentNFTsPrice(props.id);
    
    const result = await tokenActor.transfer(lenderId, rentalPrice);
    if (result == "Success") {
      const lendingResult = await opend.completeLending(props.id, lenderId, userId)
      if (lendingResult) {
        setBlur({filter: "blur(4px)"}); // 画像にぼかしを入れる
        setButton();
        // setShoudDisplay(false); // 購入が完了したら、購入画面のアイテムを非表示にする
      }
    }
    setLoaderHidden(true);
  }
  
  // --- Return Lent ---
  async function handleReturnLent() {
    console.log("Return Lent was triggered");
    setLoaderHidden(false);
    const returnRentResult = await opend.returnLentItem(props.id);
    console.log("returnLentResult" + returnRentResult);
    if (returnRentResult == "Success") {
      const admin = await NFTActor.getAdmin();
      console.log("admin" + admin);
      const transferResult = await NFTActor.transferOwnership(admin, "return rent"); // 持ち主をOpendに変更する
      console.log("transferResult" + transferResult);
      if (transferResult == "Success") {
        setShoudDisplay(false); // 返却が完了したら、アイテムを非表示にする
      }
    }
    setLoaderHidden(true);
  }

  // --- Return Rent ---
  async function handleReturnRent() {
    console.log("Return Rent was triggered");
    setLoaderHidden(false);
    const openDId = await opend.getOpenDCanisterID(); // OpendのキャニスターIDを取得する
    const returnRentResult = await opend.returnRentItem(props.id);
    console.log("returnRentResult" + returnRentResult);
    if (returnRentResult == "Success") {
      const transferResult = await NFTActor.transferOwnership(openDId, "return rent"); // 持ち主をOpendに変更する
      console.log("transferResult" + transferResult);
      if (transferResult == "Success") {
        setShoudDisplay(false); // 返却が完了したら、アイテムを非表示にする
      }
    }
    setLoaderHidden(true);
  }

  // --- Withdraw ---
  async function handleWithdraw() {
    console.log("withdraw was triggered");
    setLoaderHidden(false);
    const withdrawResult = await opend.withdrawItem(props.id);
    if (withdrawResult == "Success") {
      setShoudDisplay(false); // 貸出キャンセルが完了したら、アイテムを非表示にする
    } else {
      console.log("unlistResutl: " + withdrawResult);
    }
    setLoaderHidden(true);
  }

  // --- Buy ---
  async function handleBuy() {
    console.log("Buy was triggered");
    setLoaderHidden(false);
    // Tokenアクターにアクセスするための処理
    const tokenActor = await Actor.createActor(tokenIdlFactory, {
      agent,
      canisterId: Principal.fromText("wqmuk-5qaaa-aaaaa-aaaqq-cai"),
    });

    // NFTのPrincipalIDから売却者のIDとNFTの価格を取得する
    const sellerId = await opend.getOriginalOwner(props.id);
    const sellPrice = await opend.getListedNFTsPrice(props.id);

    // TODO:紐づけているWallet間で送金できるようにする
    // const result = await tokenActor.transfer(sellerId, sellPrice);
    const result = "Success"// Debug
    console.log("result: " + result);
    if (result == "Success") {
      // 代金を購入者から出品者に送金し、NFTのオーナーを変更する
      // TODO : CURRENT_USER_IDをログインしているユーザーに変更する
      console.log("completePurchase start");
      const transferResult = await opend.completePurchase(props.id, sellerId, userId);
      console.log("purchase: " + transferResult);
      if (transferResult == "Success"){
        setShoudDisplay(false); // 購入が完了したら、購入画面のアイテムを非表示にする
      }
    }
    setLoaderHidden(true);
  }

  // --- Unlist ---
  async function handleUnlist() {
    console.log("Unlist was triggered");
    setLoaderHidden(false);
    const unlistResutl = await opend.unlistItem(props.id);
    if (unlistResutl == "Success") {
      setShoudDisplay(false); // 売却キャンセルが完了したら、購入画面のアイテムを非表示にする
    } else {
      console.log("unlistResutl: " + unlistResutl);
    }
    setLoaderHidden(true);
  }

  return (
    <div style={{display: shoudDisplay ? "inline" : "none"}} className="disGrid-item">
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
          {lentFirstInput}
          {lentPeriod}
          {lentButton}
          {rentButton}
          {/* <a href="#" className="btn btn-secondary">Go somewhere</a> */}
        </div>
      </div>
    </div>
  );
}

export default Item;
