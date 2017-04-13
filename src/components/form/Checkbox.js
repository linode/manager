import React, { PropTypes } from 'react';

export default function Checkbox(props) {
  return (
    <div className={`Checkbox ${props.className}`}>
      <label>
        <input
          id={props.id}
          type="checkbox"
          value={props.value}
          checked={props.checked}
          disabled={props.disabled}
          onChange={props.onChange}
          name={props.name}
          className="Checkbox-input"
        />
        {props.label ? <span className="col-form-label Checkbox-label">{props.label}</span> : null}
      </label>
    </div>
  );
}

Checkbox.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.bool,
  id: PropTypes.string,
};

Checkbox.defaultProps = {
  className: '',
};

