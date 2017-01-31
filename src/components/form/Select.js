import React, { PropTypes } from 'react';

export default function Select(props) {
  return (
    <span className="Select">
      <select
        id={props.id}
        className="form-control"
        value={props.value.toString()}
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
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
  id: PropTypes.string,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  options: PropTypes.array,
  children: PropTypes.array,
};
