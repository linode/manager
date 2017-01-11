import React from 'react';

import Radio from './Radio';
import Select from './Select';

export default function RadioSelectCombo(props) {
  return (
    <div className="RadioSelectCombo">
      <Radio
        value={props.radioValue}
        checked={props.radioChecked}
        onChange={props.radioOnChange}
        label={props.radioLabel}
      />
      <Select
        value={props.selectValue}
        onChange={props.selectOnChange}
        label={props.selectLabel}
        disabled={props.selectDisabled}
        options={props.selectOptions}
      />
    </div>
  );
}

RadioSelectCombo.defaultProps = {
  selectLabel: '',
}
