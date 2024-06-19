import React from "react";

function PriceLabel(props) {
    return (
        <div className="disButtonBase-root disChip-root makeStyles-price-23 disChip-outlined dis-block text-dark">
            <span className="disChip-label">{props.sellPrice} ARIGATO</span>
        </div>
    )
}

export default PriceLabel;