import PropTypes from 'prop-types';
import React from 'react';

import Checkbox from './Checkbox';
import Input from './Input';

export default function CheckboxInputCombo(props) {
  return (
    <div className="CheckboxInputCombo">
      <Checkbox
        checked={props.checkboxChecked}
        onChange={props.checkboxOnChange}
        label={props.checkboxLabel}
        value={props.checkboxValue}
      />
      <Input
        value={props.inputValue}
        type={props.inputType}
        onChange={props.inputOnChange}
        label={props.inputLabel}
        disabled={!props.checkboxChecked || props.inputDisabled}
        placeholder={props.inputPlaceholder}
      />
    </div>
  );
}

CheckboxInputCombo.propTypes = {
  checkboxOnChange: PropTypes.func.isRequired,
  checkboxLabel: PropTypes.string.isRequired,
  checkboxChecked: PropTypes.bool.isRequired,
  checkboxValue: PropTypes.object,
  inputOnChange: PropTypes.func.isRequired,
  inputValue: PropTypes.any.isRequired,
  inputType: PropTypes.string,
  inputDisabled: PropTypes.bool,
  inputLabel: PropTypes.string,
  inputPlaceholder: PropTypes.string,
};
