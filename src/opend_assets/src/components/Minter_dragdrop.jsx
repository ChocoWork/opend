import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useDropzone } from 'react-dropzone';
import { opend } from "../../../declarations/opend";
import { Principal } from "@dfinity/principal";
import Item from "./Item";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';

function Minter() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [nftPrincipal, setNFTPrincipal] = useState("");
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [items, setItems] = useState([{ authorType: "", name: "", share: "" }]);
  const [isResaleProhibited, setIsResaleProhibited] = useState(false);
  const [isResalePriceRange, setIsResalePriceRange] = useState(false);
  const [isNonLending, setIsNonLending] = useState(false);
  const [isLendingPriceRange, setIsLendingPriceRange] = useState(false);
  const fileInput = useRef(null);
  const [image, setImage] = useState(null);

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

  async function onSubmit(data) {
    try {
      console.log("onSubmit function is running");
      setLoaderHidden(false);
      console.log(data.image)
      console.log(data.name);
      const name = data.name;
      
      const image = data.image;

      console.log("await image.arrayBuffer()");
      const imageArray = await image.arrayBuffer();
      console.log("[...new Uint8Array(imageArray)]");
      const imageByteData = [...new Uint8Array(imageArray)];
      console.log("await opend.mint(imageByteData, name)");
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

  useEffect(() => {
    if (items.length === 0) {
      setItems([{ authorType: "", name: "", share: "" }]);
    }
  }, []);

  const handleItemChange = (index, field, value) => {
    const newItems = items.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setItems(newItems);
  };

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

  const onFileDrop = (acceptedFiles) => {
    console.log(acceptedFiles);
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
        <div className="container">
          <div className="g-5 text-start">
            <div className="col-12">
              <h4 className="mb-3">Item Information</h4>
              <form className="needs-validation" noValidate onSubmit={handleSubmit(onSubmit)}>
                <div className="row g-3">
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
                    {errors.image && <p>This field is required</p>}
                  </div>
                  <div className="col-12">
                    <label htmlFor="item-name" className="form-label">Item Name</label>
                    <input {...register("name", {required: true})} type="text" className="form-control" id="item-name" placeholder="Book (1)" required />
                    {errors.name && <p>This field is required</p>}
                  </div>
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
          Minted!
        </h3>
        <div className="horizontal-center">
          <Item id={nftPrincipal} />
        </div>
      </div>
    );
  }
}

export default Minter;
