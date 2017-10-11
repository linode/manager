import PropTypes from 'prop-types';
import React from 'react';

export default function Radio(props) {
  return (
    <div className={`Radio ${props.className}`}>
      <label>
        <input
          id={props.id || props.name}
          name={props.name}
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
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  label: PropTypes.any,
  id: PropTypes.string,
  className: PropTypes.string,
};

Radio.defaultProps = {
  className: '',
};
