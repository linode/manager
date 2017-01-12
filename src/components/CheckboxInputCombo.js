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
      />
      <Input
        value={props.inputValue}
        type={props.inputType}
        onChange={props.inputOnChange}
        label={props.inputLabel}
      />
    </div>
  );
}
