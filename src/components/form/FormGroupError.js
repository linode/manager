import React, { PropTypes } from 'react';


export default function FormGroupError(props) {
  const { fieldErrors } = props;

  return (
    <div className="form-control-feedback">
      {fieldErrors.map(error => <div key={error}>{error.reason}</div>)}
    </div>
  );
}

FormGroupError.propTypes = {
  fieldErrors: PropTypes.array.isRequired,
};
