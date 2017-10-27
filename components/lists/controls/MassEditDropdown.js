import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Dropdown } from '../../dropdowns';


export default class MassEditDropdown extends Component {
  // Indeterminate is a javascript-only property of a DOM node. We must modify it directly.
  componentDidUpdate() {
    this.checkbox.indeterminate = this.props.indeterminate;
    this.checkbox.checked = this.props.checked;
  }

  render() {
    const { checked, disabled, groups, onChange } = this.props;

    return (
      <div className="input-group">
        <span className="input-group-addon">
          <input
            type="checkbox"
            name="select-all"
            id="select-all"
            onChange={function (e) {
              onChange(e.target.checked);
            }}
            ref={(element) => { this.checkbox = element; }}
            checked={checked}
          />
        </span>
        <Dropdown groups={groups} disabled={disabled} leftOriented />
      </div>
    );
  }
}

MassEditDropdown.propTypes = {
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  indeterminate: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  groups: PropTypes.array.isRequired,
};

MassEditDropdown.defaultProps = {
  checked: false,
};
