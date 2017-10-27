import PropTypes from 'prop-types';
import React from 'react';

import Input from './Input';


const str = ['an extremely weak', 'a very weak', 'a weak', 'a strong', 'a very strong'];

export default function PasswordInput(props) {
  // eslint-disable-next-line no-undef
  const strength = zxcvbn(props.value);

  return (
    <div className={`PasswordInput ${props.className}`}>
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
         This is {str[strength.score]} password.
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
  className: PropTypes.string,
};

PasswordInput.defaultProps = {
  passwordType: 'offline_fast_hashing_1e10_per_second',
  disabled: false,
  className: '',
};
