import React from "react";

function Button (props) {
    return (
        <div className="Chip-root makeStyles-chipBlue-108 Chip-clickable">
            <span onClick={props.handleOnclick} className="form-Chip-label">
              {props.text}
            </span>
        </div>
    )
}

export default Button;
