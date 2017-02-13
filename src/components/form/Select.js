import React, { PropTypes } from 'react';

export default function Select(props) {
  return (
    <span className="Select">
      <select
        className="form-control"
        name={props.name}
        value={props.value}
        disabled={props.disabled}
        onChange={props.onChange}
      >
        {props.options ? props.options.map((option, i) =>
          <option key={i} value={option.value} disabled={option.disabled}>
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

Select.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  options: PropTypes.array,
  children: PropTypes.array,
};
