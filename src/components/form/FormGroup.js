import React, { PropTypes } from 'react';

import FormGroupError from '~/components/form/FormGroupError';


export default function FormGroup(props) {
  const { name, errors = {}, crumbs } = props;

  const crumb = (crumbs ? `.${crumbs}` : '');
  const fieldErrors = errors[`${name}${crumb}`];

  return (
    <div
      className={`form-group ${
        (fieldErrors && fieldErrors.length) ? 'has-danger' : ''
        } ${props.className}`}
    >
      {props.children}
      {fieldErrors && fieldErrors.length ? <FormGroupError fieldErrors={fieldErrors} /> : null}
    </div>
  );
}

FormGroup.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string,
  errors: PropTypes.object,
  crumbs: PropTypes.string,
  children: PropTypes.node,
};

FormGroup.defaultProps = {
  className: '',
};
