import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useDropzone } from 'react-dropzone';
import { opend } from "../../../declarations/opend";
import { Principal } from "@dfinity/principal";
import Item from "./Item";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';

function Minter() {
  // register:フォームのすべての入力を登録して追加するためのオブジェクト
  // handleSubmit:submitボタンが押されたときに呼び出される関数
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  const [nftPrincipal, setNFTPrincipal] = useState("");
  const [loaderHidden, setLoaderHidden] = useState(true);

  // State to manage the items (creators/companies)
  const [items, setItems] = useState([{ authorType: "", name: "", share: "" }]);

  const [isResaleProhibited, setIsResaleProhibited] = useState(false);
  const [isResalePriceRange, setIsResalePriceRange] = useState(false);
  const [isNonLending, setIsNonLending] = useState(false);
  const [isLendingPriceRange, setIsLendingPriceRange] = useState(false);
  const fileInput = useRef(null);
  const [image, setImage] = useState(null);
  const [collection, setCollection] = useState("");
  const [showNewCollectionName, setShowNewCollectionName] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/x-png,image/jpeg,image/gif,image/svg+xml,image/webp',
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setValue("image", file); // Manually set the value of the file input
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  });

  // handleSubmitをトリガされたときにregisterに格納されたフォームの情報を受け取る関数
  async function onSubmit(data) {
    // TODO : 複数オーナーを実現したい
    // TODO : 画像だけでなく、書籍、音楽等、さまざまな形式に対応させたい
    try {
      console.log("onSubmit function is running");

      // data check debug
      console.log(data.image)
      console.log(data.name);

      setLoaderHidden(false);
      const name = data.name;
      
      // 画像を複数読ませる場合は配列指定が必要
      // const image = data.image[0];

      // 画像を複数読ませる必要がない場合には不要
      const image = data.image;

      console.log("await image.arrayBuffer()");
      const imageArray = await image.arrayBuffer();
      console.log("[...new Uint8Array(imageArray)]");
      const imageByteData = [...new Uint8Array(imageArray)];
      console.log("await opend.mint(imageByteData, name)");

      // mint関数の引数を変更する必要がある
      const newNFTID = await opend.mint(imageByteData, name);

      console.log(newNFTID.toText());
      setLoaderHidden(true);
      setNFTPrincipal(newNFTID);
    } catch (error) {
      console.error("Error in onSubmit function: ", error);
    }
  }

  const addItem = () => {
    setItems((prevItems) => [...prevItems, { authorType: "", name: "", share: "" }]);
  };

  // Effect to set initial item on component mount
  useEffect(() => {
    if (items.length === 0) {
      setItems([{ authorType: "", name: "", share: "" }]);
    }
  }, []);

  // Handle change for each item
  const handleItemChange = (index, field, value) => {
    const newItems = items.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setItems(newItems);
  };

  // Handle item removal
  const handleItemRemoval = (index) => {
    const newItems = items.filter((item, i) => i !== index);
    setItems(newItems);
  };

  const handleClick = () => {
    if (fileInput.current) {
      fileInput.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setValue("image", file); // Manually set the value of the file input
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCollectionChange = (event) => {
    setCollection(event.target.value);
    setShowNewCollectionName(event.target.value === "Create Collection");
  };

  if (nftPrincipal === "") {
    return (
      <div className="minter-container">
        <div hidden={loaderHidden} className="lds-ellipsis">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        {/* カスタムコード ↓*/}
        <div className="container">
          <div className="g-5 text-start">
            <div className="col-12">
              <h4 className="mb-3">Item Information</h4>
              <form className="needs-validation" noValidate onSubmit={handleSubmit(onSubmit)}>
                <div className="row g-3">
                  
                  <div className="col-12">
                    <label htmlFor="item-category" className="form-label">Item Category</label>
                    <select className="form-select" id="item-category" required>
                      <option value="">Choose...</option>
                      <option>Art</option>
                      <option>Book</option>
                      <option>Music</option>
                      <option>Real Asset</option>
                    </select>
                    <div className="invalid-feedback">
                      Please select an Item Category.
                    </div>
                  </div>

                  {/* TODO : 作成したコレクションを表示させる */}
                  <div className="col-12">
                    <label htmlFor="collection" className="form-label">Collection</label>
                    <select className="form-select" id="collection" required onChange={handleCollectionChange}>
                      <option value="">Choose...</option>
                      <option>Create Collection</option>
                    </select>
                    <div className="invalid-feedback">
                      Please select a Collection.
                    </div>
                  </div>

                  {showNewCollectionName && (
                    <div className="col-12">
                      <label htmlFor="newcollectionname" className="form-label">New Collection Name</label>
                      <input type="text" className="form-control" id="newcollectionname" placeholder="Please enter your new collection name" />
                      <div className="invalid-feedback">
                        New Collection Name is required.
                      </div>
                    </div>
                  )}

                  <div className="col-12">
                    <label htmlFor="item-data" className="form-label">Item Data</label>
                    <div {...getRootProps()} className="upload-container border rounded d-flex align-items-center justify-content-center p-3" onClick={handleClick}>
                      <input {...getInputProps()} />
                      <div>
                        {image
                          ? <img src={image} className="makeStyles-image-19" alt="Selected" />
                          : (<><FontAwesomeIcon icon={faPlus} size="3x" /><p className="non-margin">Drag and drop data</p></>)
                        }
                        
                        <input
                          {...register("image", { required: true })}
                          className="upload"
                          id="item-data"
                          ref={fileInput}
                          style={{ display: 'none' }} 
                          type="file"
                          accept="image/x-png,image/jpeg,image/gif,image/svg+xml,image/webp"
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>

                    <div className="invalid-feedback">
                      {errors.image && <p>Item Data is required</p>}
                    </div>
                  </div>

                  <div className="col-12">
                    <label htmlFor="item-name" className="form-label">Item Name</label>
                    <input {...register("name", {required: true})} type="text" className="form-control" id="item-name" placeholder="Book (1)" required />
                    <div className="invalid-feedback">
                      {errors.image && <p>Item Name is required</p>}
                    </div>
                  </div>

                  <div className="col-12">
                    <label htmlFor="discription" className="form-label">Discription</label>
                    <input type="text" className="form-control" id="discription" placeholder="" />
                    <div className="invalid-feedback">
                      Discription is required.
                    </div>
                  </div>

                  {/* TODO : 複数のクリエイターや企業を追加できるようにボタンを設置する */}
                  <div className="col-12">
                    {items.map((item, index) => (
                      <div className="row" key={index}>
                        <div className="col-md-3">
                          {index === 0 && <label htmlFor={`author${index}`} className="form-label">Creator / Company</label>}
                          <select
                            className="form-select"
                            id={`author${index}`}
                            required
                            value={item.authorType}
                            onChange={(e) => handleItemChange(index, "authorType", e.target.value)}
                          >
                            <option value="">Choose...</option>
                            <option>Creator</option>
                            <option>Company</option>
                          </select>
                          <div className="invalid-feedback">
                            Creator or Company is required.
                          </div>
                        </div>

                        {/* <div className="col-md-6"> */}
                        <div className={items.length > 1 ? "col-md-6" : "col-md-9"}>
                          {index === 0 && <label htmlFor={`name${index}`} className="form-label">Name</label>}
                          <input
                            type="text"
                            className="form-control"
                            id={`name${index}`}
                            placeholder=""
                            required
                            value={item.name}
                            onChange={(e) => handleItemChange(index, "name", e.target.value)}
                          />
                          <div className="invalid-feedback">
                            Name is required.
                          </div>
                        </div>

                        <div className="col-md-2">
                          {items.length > 1 && index === 0 && <label htmlFor={`share${index}`} className="form-label">Profit Share</label>}
                          {items.length > 1 && (
                            <input
                              type="text"
                              className="form-control"
                              id={`share${index}`}
                              placeholder=""
                              required
                              value={item.share}
                              onChange={(e) => handleItemChange(index, "share", e.target.value)}
                            />
                          )}
                          <div className="invalid-feedback">
                            Profit share is required.
                          </div>
                        </div>

                        
                        <div className="col-md-1 align-items-center">
                          {items.length > 1 && index === 0 && <label htmlFor={`share${index}`} className="form-label">Delete</label>}
                          {items.length > 1 && (
                            <button type="button" className="btn btn-danger btn-sm" onClick={() => handleItemRemoval(index)}>
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    <button className="w-100 btn btn-bg-gray btn-sm mt-1" type="button" onClick={addItem}>Add</button>
                    <div className="col-12">
                      <div className="row">
                        <div className="col-md-6">
                          <label htmlFor="price" className="form-label">Price</label>
                          <input type="text" className="form-control" id="price" placeholder="" required />
                          <div className="invalid-feedback">
                            Price is required.
                          </div>
                        </div>

                        <div className="col-md-6">
                          <label htmlFor="quantity" className="form-label">Quantity</label>
                          <input type="text" className="form-control" id="quantity" placeholder="" required />
                          <small className="text-danger">※Item There is a $15 listing fee per item</small>
                          <div className="invalid-feedback">
                            Quantity is required.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="my-4" />

                  <h4 className="mb-3">Resale Setting</h4>

                  {/* TODO: Resale Prohibited(再販禁止) */}
                  <div className="col-12">
                    <div className="row">
                      <div className="col-10">
                      <label htmlFor="resale-prohibited" className="form-label">Resale Prohibited</label>
                      </div>
                      <div className="col-2">
                        <div className="toggle_button">
                          <input id="resale-prohibited" className="toggle_input" type="checkbox" onChange={() => setIsResaleProhibited(!isResaleProhibited)} />
                          <label htmlFor="resale-prohibited" className="toggle_label" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TODO: Sale Profit Share(売却時の利益率) */}
                  {/* Resale Prohibitedが無効の場合のみ設定可能にする */}
                  {!isResaleProhibited && (
                    <div className="col-12">
                      <label htmlFor="itemname" className="form-label">Sale Profit Share</label>
                      <input type="text" className="form-control" id="itemname" placeholder="0 ~ 100 [%]" required />
                      <div className="invalid-feedback">
                      Sale Profit Share is required.
                      </div>
                    </div>
                  )}

                  {/* TODO: Selling Price Range(売値幅) */}
                  {/* Resale Prohibitedが無効の場合のみ設定可能にする */}
                  {!isResaleProhibited && (
                  <div className="col-12">
                    <div className="row">
                      <div className="col-10">
                        <label htmlFor="selling-price-range" className="form-label">Selling Price Range</label>
                      </div>
                      <div className="col-2">
                        <div className="toggle_button">
                          <input id="selling-price-range" className="toggle_input" type="checkbox" onChange={() => setIsResalePriceRange(!isResalePriceRange)} />
                          <label htmlFor="selling-price-range" className="toggle_label" />
                        </div>
                      </div>
                      {isResalePriceRange && (
                        <div className="col-12">
                          <div className="row">
                            <div className="col-6">
                              <div class="input-group has-validation">
                                <span class="input-group-text">Min</span>
                                <input type="text" className="form-control" id="min-price" placeholder="" required="" />
                                <div class="invalid-feedback">
                                  Min Price is required.
                                </div>
                              </div>
                            </div>
                            <div className="col-6">
                              <div class="input-group has-validation">
                                <span class="input-group-text">Max</span>
                                <input type="text" className="form-control" id="max-price" placeholder="" required="" />
                                <div class="invalid-feedback">
                                  Max Price is required.
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  )}

                  <hr className="my-4" />
                  <h4 className="mb-3">Lending Setting</h4>

                  {/* TODO: Non-lending(貸出禁止) */}
                  <div className="col-12">
                    <div className="row">
                      <div className="col-10">
                        <label htmlFor="non-lending" className="form-label">Non Lending</label>
                      </div>
                      <div className="col-2">
                        <div className="toggle_button">
                          <input id="non-lending" className="toggle_input" type="checkbox" onChange={() => setIsNonLending(!isNonLending)} />
                          <label htmlFor="non-lending" className="toggle_label" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TODO: Lend Profit Share(貸出時の利益率) */}
                  {/* Non-lendingが無効の場合のみ設定可能にする */}
                  {!isNonLending && (
                    <div className="col-12">
                      <label htmlFor="lend-profit-share" className="form-label">Lend Profit Share</label>
                      <input type="text" className="form-control" id="lend-profit-share" placeholder="0 ~ 100 [%]" required />
                      <div className="invalid-feedback">
                        Lend Profit Share is required.
                      </div>
                    </div>
                  )}

                  {/* TODO: Lending Price Range(貸出値幅) */}
                  {/* Non-lendingが無効の場合のみ設定可能にする */}
                  {!isNonLending && (
                    <div className="col-12">
                      <div className="row">
                        <div className="col-10">
                          <label htmlFor="lend-price-range" className="form-label">Lending Price Range</label>
                        </div>
                        <div className="col-2">
                          <div class="toggle_button">
                            <input id="toggle" class="toggle_input" type='checkbox' onChange={() => setIsLendingPriceRange(!isLendingPriceRange)} />
                            <label for="toggle" class="toggle_label"/>
                          </div>
                        </div>
                        {isLendingPriceRange && (
                          <div className="col-12">
                            <div className="row">
                              <div className="col-6">
                                <div class="input-group has-validation">
                                  <span class="input-group-text">Min</span>
                                  <input type="text" className="form-control" id="minPrice" placeholder="" required="" />
                                  <div class="invalid-feedback">
                                    Min Price is required.
                                  </div>
                                </div>
                              </div>
                              <div className="col-6">
                                <div class="input-group has-validation">
                                  <span class="input-group-text">Max</span>
                                  <input type="text" className="form-control" id="maxPrice" placeholder="" required="" />
                                  <div class="invalid-feedback">
                                    Max Price is required.
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <hr className="my-4" />

                <button className="w-100 btn btn-secondary btn-lg" type="submit">Create Item</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="minter-container">
        <h3 className="Typography-root makeStyles-title-99 Typography-h3 form-Typography-gutterBottom">
          Created!
        </h3>
        <div className="horizontal-center">
          <Item id={nftPrincipal} />
        </div>
      </div>
    );
  }
}

export default Minter;
