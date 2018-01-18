import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ModalShell from 'linode-components/dist/modals/ModalShell';
import { hideModal } from '~/actions/modal';

const mapStateToProps = (state) => ({
  ...state.modal,
});

const mapDispatchToProps = (dispatch) => ({
  close() {
    dispatch(hideModal());
  },
});

const modal = ({ open, title, body = null, close }) =>
  <ModalShell
    open={open}
    title={title}
    close={close}
  >
    {body}
  </ModalShell>;

modal.propTypes = {
  open: PropTypes.bool,
  title: PropTypes.string,
  body: PropTypes.element,
  close: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(modal);
