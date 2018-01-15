import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { ModalShell } from 'linode-components';


class PortalModal extends Component {
  constructor(props) {
    super(props);
    this.selector = document.getElementById('portal-modal');
  }

  render() {
    const { title, onClose } = this.props;
    return ReactDOM.createPortal(
      <ModalShell
        open /* close the modal by not rendering the PortalModal */
        title={title}
        close={onClose}
        {...this.props}
      />,
      this.selector
    );
  }
}

PortalModal.propTypes = {
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PortalModal;
