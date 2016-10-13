import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { hideModal } from '~/actions/modal';

export function Modal(props) {
  const { title, body, open, dispatch } = props;

  const close = () => dispatch(hideModal());

  return (
    <div // eslint-disable-line jsx-a11y/no-static-element-interactions
      className={`modal-overlay ${open ? 'open' : ''}`}
      onClick={close}
    >
      {/* eslint-disable jsx-a11y/no-static-element-interactions */}
      <div className="modal" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h3>{title}</h3>
        </header>
        <div className="modal-body">{body}</div>
      </div>
      {/* eslint-enable jsx-a11y/no-static-element-interactions */}
    </div>
  );
}

Modal.propTypes = {
  title: PropTypes.string,
  body: PropTypes.node,
  open: PropTypes.bool,
  dispatch: PropTypes.func,
};

function select(state) {
  return state.modal ? state.modal : {};
}

export default connect(select)(Modal);
