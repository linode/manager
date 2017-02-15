import React, { PropTypes } from 'react';

import Radio from './Radio';
import Input from './Input';

export default function RadioInputCombo(props) {
  return (
    <div className="RadioInputCombo">
      <Radio
        id={props.radioId}
        value={props.radioValue}
        checked={props.radioChecked}
        onChange={props.radioOnChange}
        label={props.radioLabel}
      />
      <Input
        id={props.inputId}
        value={props.inputValue}
        onChange={props.inputOnChange}
        label={props.inputLabel}
        disabled={props.inputDisabled}
        type={props.inputType}
        placeholder={props.inputPlaceholder}
      />
    </div>
  );
}

RadioInputCombo.propTypes = {
  radioId: PropTypes.string,
  radioOnChange: PropTypes.func.isRequired,
  radioLabel: PropTypes.string.isRequired,
  radioChecked: PropTypes.bool.isRequired,
  radioValue: PropTypes.object,
  inputOnChange: PropTypes.func.isRequired,
  inputId: PropTypes.string,
  inputValue: PropTypes.any.isRequired,
  inputDisabled: PropTypes.bool,
  inputLabel: PropTypes.string,
  inputType: PropTypes.string,
  inputPlaceholder: PropTypes.string,
};
