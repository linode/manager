import React, { PropTypes } from 'react';

export async function reduceErrors(response) {
  const json = await response.json();
  const errors = {};
  json.errors.forEach(error => {
    const key = (error.field + (error.field_crumbs ? '.' + error.field_crumbs : '')) || '_';
    const list = errors[key] || [];
    list.push(error);
    if (!errors[key]) {
      errors[key] = list;
    }
  });
  return errors;
}

export function ErrorSummary(props) {
  const { errors } = props;
  if (errors._ && errors._.length) {
    return (
      <div className="alert alert-danger">
        {errors._.map(error => {
          const text = error.hasOwnProperty('reason') ? error.reason : error;
          return (<div key={text}>{text}</div>);
        })}
      </div>
    );
  }
  return null;
}

ErrorSummary.propTypes = {
  errors: PropTypes.object.isRequired,
};
