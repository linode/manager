import PropTypes from 'prop-types';
import React from 'react';


export default function FormSummary(props) {
  const { className, errors, success } = props;

  let content;
  if (errors._ && errors._.length) {
    content = (
      <div className="alert alert-danger">
        {errors._.map(error => {
          const text = error.reason || error;
          return (<div key={text}>{text}</div>);
        })}
      </div>
    );
  } else if (Object.keys(errors).length > 1) {
    content = <div className="alert alert-danger">Please fix all errors before retrying.</div>;
  } else if (errors._) {
    content = success ? <div className="alert alert-success">{success}</div> : '';
  }

  return (
    <div className={`FormSummary ${className}`}>{content}</div>
  );
}

FormSummary.propTypes = {
  errors: PropTypes.object.isRequired,
  success: PropTypes.string,
  className: PropTypes.string,
};

FormSummary.defaultProps = {
  className: '',
};
