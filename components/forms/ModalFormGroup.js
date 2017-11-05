import PropTypes from 'prop-types';
import React from 'react';

import FormGroup from './FormGroup';
import FormGroupError from './FormGroupError';

export default function ModalFormGroup(props) {
  const { errors, apiKey, label, id, description, children } = props;

  return (
    <FormGroup className="row" errors={errors} name={apiKey}>
      <label className="col-sm-4 col-form-label" htmlFor={id}>{label}</label>
      <div className="col-sm-8">
        {children}
        {description ? <small className="text-muted modal-description">{description}</small> : null}
        <FormGroupError errors={errors} name={apiKey} inline={false} />
      </div>
    </FormGroup>
  );
}

ModalFormGroup.propTypes = {
  apiKey: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  errors: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  description: PropTypes.string,
};

ModalFormGroup.defaultProps = {
  apiKey: '',
  errors: {},
};
