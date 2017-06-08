import React, { Component, PropTypes } from 'react';

import { Form, SubmitButton } from '../forms';
import { CancelButton } from '../buttons';

export default class ConfirmModalBody extends Component {
  constructor() {
    super();
    this.state = { loading: false };
  }

  onSubmit = async () => {
    const { onOk } = this.props;
    this.setState({ loading: true });
    await onOk();
    this.setState({ loading: false });
  }

  render() {
    const { className, buttonText, buttonDisabledText, onCancel, noCancel, children } = this.props;
    const { loading } = this.state;

    return (
      <Form className={`ConfirmModalBody-body ${className}`} onSubmit={this.onSubmit}>
        {React.isValidElement(children) ? children : <p>{children}</p>}
        <div className="Modal-footer">
          {noCancel ? null : <CancelButton disabled={loading} onClick={onCancel} />}
          <SubmitButton
            disabled={loading}
            disabledChildren={buttonDisabledText || 'Confirmed'}
          >{buttonText || 'Confirm'}</SubmitButton>
        </div>
      </Form>
    );
  }
}

ConfirmModalBody.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any,
  buttonText: PropTypes.string,
  buttonDisabledText: PropTypes.string,
  onOk: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  noCancel: PropTypes.bool.isRequired,
};

ConfirmModalBody.defaultProps = {
  className: '',
  noCancel: false,
};
