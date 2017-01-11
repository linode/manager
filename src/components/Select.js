import React from 'react';

export default function Select(props) {
  return (
    <span className="Select">
      <select
        className="form-control"
        value={props.value}
        disabled={props.disabled}
        onChange={e => this.setState({ rootDevice: e.target.value })}
      >
        {props.options ? props.options.map((option, i) =>
          <option key={i} value={option.value}>
            {option.label}
          </option>
        ) : props.children}
      </select>
      {!props.label ? null : (
         <label className="Select-label">
           {props.label}
         </label>
       )}
    </span>
  );
}
