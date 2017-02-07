import React, { PropTypes } from 'react';

export default function FormGroupError(props) {
  const { errors, name, crumbs, inline } = props;
  const fieldErrors = errors[name + (crumbs ? `.${crumbs}` : '')];
  const errorMessageStyle = inline ? 'form-control-feedback'
    : 'form-control-feedback form-control-feedback--block';
  if (fieldErrors && fieldErrors.length) {
    return (
      <span className={errorMessageStyle}>
        {fieldErrors.map(error => <small key={error}>{error.reason}</small>)}
      </span>
    );
  }

  return null;
}

FormGroupError.propTypes = {
  errors: PropTypes.any.isRequired,
  name: PropTypes.string.isRequired,
  crumbs: PropTypes.string,
  inline: PropTypes.bool,
};

FormGroupError.defaultProps = {
  inline: true,
};
