import React, { Component, PropTypes } from 'react';

import { Input } from './';


const str = ['Extremely Weak', 'Very Weak', 'Weak', 'Moderate', 'Strong'];

export default function PasswordInput(props) {
  // eslint-disable-next-line no-undef
  const strength = zxcvbn(props.value);

  return (
    <div className="PasswordInput float-sm-left">
      <Input
        value={props.value}
        name={props.name}
        className="PasswordInput-input"
        onChange={props.onChange}
        autoComplete="off"
        type="password"
        disabled={props.disabled}
        id={props.id}
      />
      <div className={`PasswordInput-strength PasswordInput-strength--${strength.score}`}>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      {props.value === '' ? null : (
         <small className="PasswordInput-strength-text">
           {str[strength.score]}
         </small>
       )}
    </div>
  );
}

PasswordInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  errors: PropTypes.object,
  errorField: PropTypes.string,
  passwordType: PropTypes.string,
  disabled: PropTypes.bool,
  id: PropTypes.string,
};

PasswordInput.defaultProps = {
  passwordType: 'offline_fast_hashing_1e10_per_second',
  disabled: false,
};
