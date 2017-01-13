import React, { PropTypes } from 'react';

export default function FormGroupError(props) {
  const { errors, name, crumbs } = props;

  const fieldErrors = errors[name + (crumbs ? `.${crumbs}` : '')];

  if (fieldErrors && fieldErrors.length) {
    return (
      <div className="form-control-feedback">
        {fieldErrors.map(error => <div key={error}>{error.reason}</div>)}
      </div>
    );
  }

  return null;
}

FormGroupError.propTypes = {
  errors: PropTypes.any.isRequired,
  name: PropTypes.string.isRequired,
  crumbs: PropTypes.string,
};
