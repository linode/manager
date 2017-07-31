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
    // The grouping can be at most 1 level deep.
    const defaultValue = _.isUndefined(this.props.options[0].value) ?
                         this.props.options[0].options[0].value :
                         this.props.options[0].value;

    const value = this.props.value || defaultValue;
    // Update the form so the value is no longer undefined.
    if (_.isUndefined(this.props.value)) {
      this.onChange({ value: defaultValue });
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
          value={this.props.value || defaultValue}
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
