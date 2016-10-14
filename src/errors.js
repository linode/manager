import React, { PropTypes } from 'react';

export async function reduceErrors(response) {
  const json = await response.json();
  const errors = {};
  json.errors.forEach((error) => {
    const key = error.field || '_';
    const list = errors[key] || [];
    list.push(error);
    if (!errors[key]) {
      errors[key] = list;
    }
  });
  return errors;
}

export function FormGroup(props) {
  const { errors, field } = props;
  return (
    <div
      className={`form-group ${
        errors[field] && errors[field].length ? 'has-danger' : ''
      } ${props.className}`}
    >
      {props.children}
      {errors[field] && errors[field].length ?
        <div className="form-control-feedback">
          {errors[field].map(error => <div key={error}>{error.reason}</div>)}
        </div> : null}
    </div>
  );
}

FormGroup.propTypes = {
  errors: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  className: PropTypes.string,
  children: PropTypes.node,
};

export function ErrorSummary(props) {
  const { errors } = props;
  if (errors._ && errors._.length) {
    return (
      <div className="alert alert-danger">
        {errors._.map(error => <div key={error}>{error}</div>)}
      </div>
    );
  }
  return null;
}

ErrorSummary.propTypes = {
  errors: PropTypes.object.isRequired,
};
