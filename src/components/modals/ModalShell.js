import React, { PropTypes } from 'react';

export default function ModalShell(props) {
  const { title, open } = props;
  return (
    <div
      className={`modal-overlay ${open ? 'open' : ''}`}
      onClick={props.close}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h3>{title}</h3>
        </header>
        <div className="modal-body">{props.children}</div>
      </div>
    </div>
  );
}

ModalShell.propTypes = {
  title: PropTypes.string,
  children: PropTypes.any,
  open: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
};

ModalShell.defaultProps = {
  open: false,
};
