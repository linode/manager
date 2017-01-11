import React from 'react';

import Radio from './Radio';
import Input from './Input';

export default function RadioInputCombo(props) {
  return (
    <div className="RadioInputCombo">
      <Radio
        value={props.radioValue}
        checked={props.radioChecked}
        onChange={props.radioOnChange}
        label={props.radioLabel}
      />
      <Input
        value={props.inputValue}
        onChange={props.inputOnChange}
        label={props.inputLabel}
      />
    </div>
  );
}

RadioInputCombo.defaultProps = {
  inputLabel: '',
}

