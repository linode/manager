import React, { PropTypes } from 'react';

export default function Radio(props) {
  return (
    <div className="Radio">
      <label>
        <input
          id={props.id}
          type="radio"
          className="Radio-input"
          checked={props.checked}
          onChange={props.onChange}
          value={props.value}
          name={props.name}
        />
        {props.label ? <span className="col-form-label Radio-label">{props.label}</span> : null}
      </label>
    </div>
  );
}

Radio.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.bool.isRequired,
  label: PropTypes.any,
  id: PropTypes.string,
};
