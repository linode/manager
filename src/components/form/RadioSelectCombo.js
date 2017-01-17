import React, { PropTypes } from 'react';

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
        children={props.selectChildren}
      />
    </div>
  );
}

RadioSelectCombo.propTypes = {
  radioOnChange: PropTypes.func.isRequired,
  radioLabel: PropTypes.string.isRequired,
  radioChecked: PropTypes.bool.isRequired,
  radioValue: PropTypes.object,
  selectOnChange: PropTypes.func.isRequired,
  selectValue: PropTypes.object.isRequired,
  selectOptions: PropTypes.object,
  selectDisabled: PropTypes.bool,
  selectLabel: PropTypes.string,
  selectChildren: PropTypes.object,
};

RadioSelectCombo.defaultProps = {
  selectLabel: '',
  selectChildren: null,
};
