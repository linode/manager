import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { hideModal } from '~/actions/modal';

export function Modal(props) {
  const { title, body, open, dispatch } = props;

  const close = () => dispatch(hideModal());

  return (
    <div
      className={`modal-overlay ${open ? 'open' : ''}`}
      onClick={close}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h3>{title}</h3>
        </header>
        <div className="modal-body">{body}</div>
      </div>
    </div>
  );
}

Modal.propTypes = {
  title: PropTypes.string,
  body: PropTypes.node,
  open: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

Modal.defaultProps = {
  open: false,
};

function select(state) {
  return state.modal;
}

export default connect(select)(Modal);
