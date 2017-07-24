import React, { PropTypes } from 'react';

import { EmitEvent, SELECT_CHANGE } from '../utils';


export default function Select(props) {
  return (
    <span className="Select">
      <select
        id={props.id}
        className="form-control"
        value={props.value.toString()}
        name={props.name}
        id={props.id}
        disabled={props.disabled}
        onChange={(e) => {
          const value = String(e.target.value);
          if (props.name && !props.analytics.noTrack) {
            EmitEvent(
              SELECT_CHANGE,
              'select',
              'change',
              props.name,
              value,
            );
          }
          props.onChange(e);
        }}
      >
        {props.options ? props.options.map((option, i) =>
          <option key={i} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ) : props.children}
      </select>
      {!props.label ? null : (
        <label className="Select-label">
          {props.label}
        </label>
       )}
    </span>
  );
}

Select.propTypes = {
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
  id: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  options: PropTypes.array,
  children: PropTypes.array,
  analytics: PropTypes.shape({
    noTrack: PropTypes.bool.isRequired,
  }),
};

Select.defaultProps = {
  analytics: {
    noTrack: false,
  },
};
