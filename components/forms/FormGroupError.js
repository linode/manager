import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

export default function FormGroupError(props) {
  const { errors, name, crumbs, inline, className } = props;
  const baseClassName = `${className} FormGroupError`;
  const fullClassName = inline ? baseClassName : `${baseClassName} FormGroupError--block`;
  const names = Array.isArray(name) ? name : [name];
  const fieldErrors = _.flatten(names.map(function (name) {
    return errors[name + (crumbs ? `.${crumbs}` : '')] || [];
  }));
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
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).isRequired,
  className: PropTypes.string,
  crumbs: PropTypes.string,
  inline: PropTypes.bool,
};

FormGroupError.defaultProps = {
  inline: true,
  className: '',
};
