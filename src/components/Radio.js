import React from 'react';

export default function Radio(props) {
  return (
    <div className="Radio">
      <label>
        <input
          type="radio"
          className="form-control"
          checked={props.checked}
          onChange={props.onChange}
        />
        <span className="Radio-label">
          {props.label}
        </span>
      </label>
    </div>
  );
}
