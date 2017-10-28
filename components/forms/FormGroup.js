import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

export default function FormGroup(props) {
  const { errors, name, crumbs } = props;
  let fieldErrors;
  if (errors && name) {
    const names = Array.isArray(name) ? name : [name];
    const crumb = (crumbs ? `.${crumbs}` : '');
    fieldErrors = _.flatten(names.map(function (name) {
      return errors[`${name}${crumb}`] || [];
    }));
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
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).isRequired,
  crumbs: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
};

FormGroup.defaultProps = {
  className: '',
};
