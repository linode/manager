import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { CancelButton } from '../buttons';
import { Form, FormSummary, SubmitButton } from '../forms';
import { EmitEvent, MODAL_CANCEL } from '../utils';


export default class FormModalBody extends Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.onSubmit = this.props.onSubmit.bind(this);
  }

  onCancel = async () => {
    this.props.onCancel();

    if (this.props.analytics && this.props.analytics.title && !this.props.noCancelEvent) {
      EmitEvent(MODAL_CANCEL, 'modal', 'cancel', this.props.analytics.title);
    }
  }

  render() {
    const {
      className, buttonText, buttonDisabledText, noCancel, children, errors: propsErrors,
      noSubmit, noSubmitEvent,
    } = this.props;
    const { loading, errors: stateErrors = {} } = this.state;

    // This may not be needed. No one may send errors to props, but just in case.
    const errors = _.isEmpty(propsErrors) ? stateErrors : propsErrors;

    const analytics = {
      ...this.props.analytics,
      type: 'modal',
    };

    return (
      <Form
        className={className}
        onSubmit={this.onSubmit}
        noSubmitEvent={noSubmitEvent}
        analytics={analytics}
      >
        {React.isValidElement(children) ? children : <p>{children}</p>}
        <div className="Modal-footer">
          {noCancel ? null : <CancelButton disabled={loading} onClick={this.onCancel} />}
          {noSubmit ? null : <SubmitButton
            disabled={loading}
            disabledChildren={buttonDisabledText}
          >{buttonText}</SubmitButton>}
          <FormSummary errors={errors} />
        </div>
      </Form>
    );
  }
}

FormModalBody.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any,
  buttonText: PropTypes.string,
  buttonDisabledText: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  noSubmit: PropTypes.bool,
  noSubmitEvent: PropTypes.bool,
  onCancel: PropTypes.func,
  noCancel: PropTypes.bool.isRequired,
  noCancelEvent: PropTypes.bool,
  analytics: Form.propTypes.analytics,
  errors: PropTypes.object.isRequired,
};

FormModalBody.defaultProps = {
  noCancel: false,
  noCancelEvent: false,
  noSubmit: false,
  errors: {},
  buttonText: 'Save',
  buttonDisabledText: 'Saving',
  analytics: {},
};
