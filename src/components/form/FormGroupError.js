import React, { PropTypes } from 'react';


export default function FormGroupError(props) {
  const { fieldErrors } = props;

  function renderFieldErrors(fieldErrors) {
    return fieldErrors.map((error) => <div key={error.reason}>{error.reason}</div>);
  }

  return (
    <div className="form-control-feedback">
      {renderFieldErrors(fieldErrors)}
    </div>
  );
}

FormGroupError.propTypes = {
  fieldErrors: PropTypes.array.isRequired,
};
