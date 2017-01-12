import React, { PropTypes } from 'react';

import FormGroupError from '~/components/form/FormGroupError';


export default function FormGroup(props) {
  const { name, errors } = props;
  const hasErrors = errors && errors[name] && errors[name].length;

  return (
    <div
      className={`form-group ${
        hasErrors ? 'has-danger' : ''
        } ${props.className}`}
    >
      {props.children}
      <FormGroupError name={name} errors={errors}/>
    </div>
  );
}

FormGroup.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string,
  errors: PropTypes.object,
  crumbs: PropTypes.string,
};

FormGroup.defaultProps = {
  className: ''
};
