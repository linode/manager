import React, { PropTypes } from 'react';

export default function Radio(props) {
  return (
    <label className="col-form-label Radio">
      <input
        name={props.name}
        type="radio"
        className="Radio-input"
        checked={props.checked}
        onChange={props.onChange}
        value={props.value}
      />
      {props.label ? <span className="col-form-label Radio-label">{props.label}</span> : null}
    </label>
  );
}

Radio.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.object,
};
