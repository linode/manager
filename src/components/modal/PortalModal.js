import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import { ModalShell } from 'linode-components';

import { hideModal } from '~/actions/modal';

class PortalModal extends Component {
  constructor(props) {
    super(props);
    this.selector = document.getElementById('portal-modal');
  }

  render() {
    return ReactDOM.createPortal(
      <ModalShell
        title={this.props.modal.title}
        open={this.props.modal.open}
        close={() => this.props.hideModal()}
        {...this.props}
      />,
      this.selector
    );
  }
}

PortalModal.propTypes = {
  modal: PropTypes.object.isRequired,
  hideModal: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  hideModal() {
    dispatch(hideModal());
  },
});

function mapStateToProps(state) {
  return {
    modal: state.modal,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PortalModal);
