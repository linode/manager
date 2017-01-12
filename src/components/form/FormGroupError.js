import React, { PropTypes } from 'react';


export default function FormGroupError(props) {
  const { name, errors, crumbs } = props;

  if (name && errors && errors.length) {
    const fieldErrors = errors[name + (crumbs ? '.' + crumbs : '')];

    return (
      <div className="form-control-feedback">
        {fieldErrors.map(error => <div key={error}>{error.reason}</div>)}
      </div>
    );
  }

  return null;
}

FormGroupError.propTypes = {
  name: PropTypes.string,
  errors: PropTypes.object,
  crumbs: PropTypes.string,
};
