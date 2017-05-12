import React from 'react';
import { PropTypes } from 'prop-types';

import { Dropdown } from '../../dropdowns';


export default function MassEditDropdown(props) {
  const { checked, disabled, options, onChange } = props;

  return (
    <div className="input-group">
      <span className="input-group-addon">
        <input
          type="checkbox"
          onChange={function (e) {
            onChange(e.target.checked);
          }}
          checked={checked}
        />
      </span>
      <Dropdown elements={options} disabled={disabled} leftOriented />
    </div>
  );
}

MassEditDropdown.propTypes = {
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
};

MassEditDropdown.defaultProps = {
  checked: false,
};
