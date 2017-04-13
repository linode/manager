import React, { Component, PropTypes } from 'react';

import { SubmitButton } from '~/components/form';
import { CancelButton } from '~/components/buttons';

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
    const {
      className,
      buttonText,
      onCancel,
      children,
    } = this.props;
    const { loading } = this.state;
    return (
      <div className={`ConfirmModalBody-body ${className}`}>
        {React.isValidElement(children) ? children : <p>{children}</p>}
        <div className="Modal-footer">
          <CancelButton disabled={loading} onClick={onCancel} />
          <SubmitButton
            disabled={loading}
            onClick={this.handleOk}
          >{buttonText || 'Confirm'}</SubmitButton>
        </div>
      </div>);
  }
}

ConfirmModalBody.defaultProps = {
  className: '',
};

ConfirmModalBody.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any,
  buttonText: PropTypes.string,
  onOk: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
