import React from 'react';
import { PropTypes } from 'prop-types';

import { Checkbox } from '../../forms';
import { Dropdown } from '../../dropdowns';

export default function MassEditDropdown(props) {
  const { checked, disabled, groups, onChange } = props;

  return (
    <div className="input-group">
      <span className="input-group-addon">
        <Checkbox
          onChange={function (e) {
            onChange(e.target.checked);
          }}
          checked={checked}
        />
      </span>
      <Dropdown groups={groups} disabled={disabled} leftOriented />
    </div>
  );
}

MassEditDropdown.propTypes = {
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  groups: PropTypes.array.isRequired,
};

MassEditDropdown.defaultProps = {
  checked: false,
};
