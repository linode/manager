import React, { PropTypes } from 'react';

export default function FormGroup(props) {
  const { errors, name, crumbs } = props;

  const fieldErrors = errors[name + (crumbs ? `.${crumbs}` : '')];

  return (
    <div
      className={`form-group ${
        fieldErrors && fieldErrors.length ? 'has-danger' : ''
      } ${props.className}`}
    >
      {props.children}
    </div>
  );
}

FormGroup.propTypes = {
  errors: PropTypes.any.isRequired,
  name: PropTypes.string.isRequired,
  crumbs: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
};

FormGroup.defaultProps = {
  className: '',
};
