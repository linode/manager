import React, { PropTypes } from 'react';

export default function Checkbox(props) {
  return (
    <div className="Checkbox">
      <label>
        <input
          type="checkbox"
          value={props.value}
          checked={props.checked}
          onChange={props.onChange}
          className="Checkbox-input"
        />
        {props.label ? <span className="Checkbox-label">{props.label}</span> : null}
      </label>
    </div>
  );
}

Checkbox.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  value: PropTypes.object,
};
