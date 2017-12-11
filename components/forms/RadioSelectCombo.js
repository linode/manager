import PropTypes from 'prop-types';
import React from 'react';

import Radio from './Radio';
import Select from './Select';

export default function RadioSelectCombo(props) {
  return (
    <div className="RadioSelectCombo clearfix">
      <Radio
        className="float-sm-left"
        value={props.radioValue}
        checked={props.radioChecked}
        onChange={props.radioOnChange}
        label={props.radioLabel}
      />
      <Select
        id={props.selectId}
        value={props.selectValue}
        onChange={props.selectOnChange}
        label={props.selectLabel}
        disabled={props.selectDisabled}
        options={props.selectOptions}
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
  selectId: PropTypes.string,
  selectValue: PropTypes.any.isRequired,
  selectOptions: PropTypes.any,
  selectDisabled: PropTypes.bool,
  selectLabel: PropTypes.string,
};

RadioSelectCombo.defaultProps = {
  selectLabel: '',
  selectChildren: null,
};
