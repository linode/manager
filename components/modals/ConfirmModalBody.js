import React, { Component, PropTypes } from 'react';

import { SubmitButton } from '../forms';
import { CancelButton } from '../buttons';

export default class ConfirmModalBody extends Component {
  constructor() {
    super();
    this.state = { loading: false };
  }

  handleOk = async () => {
    const { onOk } = this.props;
    this.setState({ loading: true });
    await onOk();
    this.setState({ loading: false });
  }

  render() {
    const { className, buttonText, buttonDisabledText, onCancel, children } = this.props;
    const { loading } = this.state;

    return (
      <div className={`ConfirmModalBody-body ${className}`}>
        {React.isValidElement(children) ? children : <div>{children}</div>}
        <div className="Modal-footer">
          <CancelButton disabled={loading} onClick={onCancel} />
          <SubmitButton
            disabled={loading}
            disabledChildren={buttonDisabledText}
            onClick={this.handleOk}
          >{buttonText || 'Confirm'}</SubmitButton>
        </div>
      </div>);
  }
}

ConfirmModalBody.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any,
  buttonText: PropTypes.string,
  buttonDisabledText: PropTypes.string,
  onOk: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

ConfirmModalBody.defaultProps = {
  className: '',
};
