import React, { PropTypes } from 'react';

export default function FormGroupError(props) {
  const { errors, name, crumbs, inline, className } = props;
  const fieldErrors = errors[name + (crumbs ? `.${crumbs}` : '')];
  const baseClassName = `${className} FormGroupError`;
  const fullClassName = inline ? baseClassName
                          : `${baseClassName} FormGroupError--block`;
  if (fieldErrors && fieldErrors.length) {
    return (
      <ul className={fullClassName}>
        {fieldErrors.map(error => <li key={error.reason}>{error.reason}</li>)}
      </ul>
    );
  }

  return null;
}

FormGroupError.propTypes = {
  errors: PropTypes.any.isRequired,
  name: PropTypes.string.isRequired,
  className: PropTypes.string,
  crumbs: PropTypes.string,
  inline: PropTypes.bool,
};

FormGroupError.defaultProps = {
  inline: true,
  className: '',
};
