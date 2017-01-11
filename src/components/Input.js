import React from 'react';

export default function Input(props) {
  return (
    <span className="Input">
      <input
        {...props}
        className={`form-control ${props.className}`}
    />
    {!props.label ? null : (
      <label className="Input-label">
        {props.label}
      </label>
    )}
    </span>
  );  
}
