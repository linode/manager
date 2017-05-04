import React, { PropTypes } from 'react';

export default function FormGroup(props) {
  const { errors, name, crumbs } = props;
  let fieldErrors;
  if (errors && name) {
    const crumb = (crumbs ? `.${crumbs}` : '');
    fieldErrors = errors[`${name}${crumb}`];
  }

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
  errors: PropTypes.any,
  name: PropTypes.string,
  crumbs: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
};

FormGroup.defaultProps = {
  className: '',
};
