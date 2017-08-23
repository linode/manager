import React, { Component, PropTypes } from 'react';


export default class FormSummary extends Component {
  render() {
    const { className, errors, success } = this.props;

    let content;
    if (errors._ && errors._.length) {
      content = (
        <div className="alert alert-danger">
          {errors._.map(error => {
            const text = error.hasOwnProperty('reason') ? error.reason : error;
            return (<div key={text}>{text}</div>);
          })}
        </div>
      );
    } else if (Object.keys(errors).length === 1) {
      content = success ? <div className="alert alert-success">{success}</div> : '';
    } else if (errors._) {
      content = <div className="alert alert-danger">Please fix all errors before retrying.</div>;
    }

    return (
      <div className={`FormSummary ${className}`}>{content}</div>
    );
  }
}

FormSummary.propTypes = {
  errors: PropTypes.object.isRequired,
  success: PropTypes.string,
  className: PropTypes.string,
};

FormSummary.defaultProps = {
  className: '',
};
