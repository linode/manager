import React, { PropTypes } from 'react';

export default function FormRow({ label, errors, children, showIf = true }) {
  if (!showIf) {
    return null;
  }

  return (
    <div className="FormRow">
      <div className="FormRow-label">{label ? `${label}:` : null}</div>
      <div className="FormRow-content">
        {children}
        {!errors ? null : (
          <div className="alert alert-danger">
            <ul>
              {errors.map(e => <li key={e}>{e}</li>)}
            </ul>
          </div>)}
      </div>
    </div>
  );
}

FormRow.propTypes = {
  children: PropTypes.any,
  label: PropTypes.string,
  showIf: PropTypes.bool,
  errors: PropTypes.array,
};
