import React, { PropTypes } from 'react';

export default function Radio(props) {
  return (
    <div className="Radio">
      <label>
        <input
          type="radio"
          className="form-control Radio-input"
          checked={props.checked}
          onChange={props.onChange}
          value={props.value}
        />
        {props.label ? <span className="Radio-label">{props.label}</span> : null}
      </label>
    </div>
  );
}

Radio.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  value: PropTypes.object,
};
