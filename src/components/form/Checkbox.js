import React, { PropTypes } from 'react';

export default function Checkbox(props) {
  return (
    <label htmlFor={props.id} className={`col-form-label Checkbox ${props.className}`}>
      <input
        id={props.id}
        type="checkbox"
        value={props.value}
        checked={props.checked}
        onChange={props.onChange}
        className="Checkbox-input"
      />
      {props.label ? <span className="col-form-label Checkbox-label">{props.label}</span> : null}
    </label>
  );
}

Checkbox.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  id: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.object,
};

Checkbox.defaultProps = {
  className: '',
};

