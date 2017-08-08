import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import VendorSelect from 'react-select-plus';

import { EmitEvent, SELECT_CHANGE } from '../utils';


// This allows us to look up 'Select' in tests and differentiate between our component and the
// upstream one.
VendorSelect.displayName = 'VendorSelect';

export default class Select extends Component {
  onChange = (e) => {
    const rawValue = e.target ? e.target.value : e.value;
    const value = this.props.multi ? e.map(o => o.target ? o.target.value : o.value) : rawValue;
    if (this.props.name && !this.props.analytics.noTrack) {
      EmitEvent(
        SELECT_CHANGE,
        'select',
        'change',
        this.props.name,
        value,
      );
    }

    this.props.onChange({ target: { value, name: this.props.name } });
  }

  render() {
    const { options } = this.props;

    let defaultValue;
    // Putting a try-catch in here as a final resort because this commit is a patch and may not
    // have been thoroughly tested.
    try {
      if (options && options.length) {
        if (options[0] && options[0].value) {
          defaultValue = options[0].value;
        } else if (options[0].options && options[0].options.length) {
          // The grouping can be at most 1 level deep.
          defaultValue = options[0].options[0].value;
        }
      }
    } catch (e) {
      // Nothing to do.
    }

    let value = this.props.value;

    // Update the form so the value with the default value so the state is no longer unset
    // -- unless the default is itself unset (in which case we enter an infinite loop).
    const unset = (v) => [undefined, null].indexOf(v) !== -1;
    if (unset(value) && !unset(defaultValue)) {
      value = defaultValue;
      // setState will not be allowed during render, so take it out of the current function.
      setTimeout(() => this.onChange({ target: { value } }), 0);
    }

    return (
      <span className={this.props.className}>
        {/* This allows us to use this in tests like a normal input. */}
        <input
          type="hidden"
          id={this.props.id}
          name={this.props.name}
          onChange={this.onChange}
          value={value}
        />
        <VendorSelect
          clearable={false}
          name={`${this.props.name}-internal`}
          {..._.omit(this.props, ['className', 'id', 'name'])}
          value={value}
          onChange={this.onChange}
        />
        {!this.props.label ? null : (
          <label className="Select-label">
            {this.props.label}
          </label>
        )}
      </span>
    );
  }
}

Select.propTypes = {
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.any,
  label: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
  multi: PropTypes.bool,
  analytics: PropTypes.shape({
    noTrack: PropTypes.bool.isRequired,
  }),
};

Select.defaultProps = {
  analytics: {
    noTrack: false,
  },
  className: '',
};
