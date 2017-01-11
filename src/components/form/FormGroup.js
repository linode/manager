import React, { PropTypes } from 'react';

import FormGroupError from '~/components/form/FormGroupError';

export function FormGroup(props) {
  const { errors, name, crumbs } = props;

  const fieldErrors = errors[name + (crumbs ? '.' + crumbs : '')];

  return (
    <div
      className={`form-group ${
        errors[name] && errors[name].length ? 'has-danger' : ''
      } ${props.className}`}
    >
      {props.children}
    </div>
  );
}

FormGroup.propTypes = {
  errors: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  crumbs: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
};

FormGroup.defaultProps = {
  className: '',
};
