import React from 'react';

export default function Checkbox(props) {
  return (
    <div className="Checkbox">
    <label>
    <input
    type="checkbox"
    checked={props.checked}
    onChange={props.onChange}
    />
    <span>
      {props.label}
    </span>
      </label>
    </div>
  );
}
