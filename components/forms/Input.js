import React, { PropTypes } from 'react';

export default function Input(props) {
  return (
    <span className="Input">
      <input
        {...props}
        className={`form-control ${props.className}`}
      />
      {!props.label ? null : <label className="Input-label">{props.label}</label>}
    </span>
  );
}

Input.propTypes = {
  value: PropTypes.any,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  type: PropTypes.string,
  label: PropTypes.string,
  className: PropTypes.string,
  multiple: PropTypes.bool,
};

Input.defaultProps = {
  className: '',
};
