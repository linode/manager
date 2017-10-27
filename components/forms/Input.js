import PropTypes from 'prop-types';
import React from 'react';

export default function Input(props) {
  return (
    <span className={`Input ${props.className}`}>
      <input
        {...props}
        id={props.id || props.name}
        className="form-control"
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
  id: PropTypes.string,
  name: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  pattern: PropTypes.string,
  maxlength: PropTypes.number,
};

Input.defaultProps = {
  className: '',
};
