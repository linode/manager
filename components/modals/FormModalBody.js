import React, { Component, PropTypes } from 'react';

import { CancelButton } from '../buttons';
import { Form, FormSummary, SubmitButton } from '../forms';
import { EmitEvent, MODAL_CANCEL } from '../utils';


export default class FormModalBody extends Component {
  constructor() {
    super();
    this.state = { loading: false };
  }

  onSubmit = async () => {
    this.setState({ loading: true });
    await this.props.onSubmit();
    this.setState({ loading: false });
  }

  onCancel = async () => {
    this.props.onCancel();

    if (this.props.analytics && this.props.analytics.title && !this.props.noCancelEvent) {
      EmitEvent(MODAL_CANCEL, 'modal', 'cancel', this.props.analytics.title);
    }
  }

  render() {
    const {
      className, buttonText, buttonDisabledText, noCancel, children, errors, noSubmitEvent,
    } = this.props;
    const { loading } = this.state;

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
          <SubmitButton
            disabled={loading}
            disabledChildren={buttonDisabledText}
          >{buttonText}</SubmitButton>
          <FormSummary className="text-sm-right" errors={errors} />
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
  errors: {},
  buttonText: 'Save',
  buttonDisabledText: 'Saving',
  analytics: {},
};
