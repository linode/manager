import PropTypes from 'prop-types';
import React from 'react';

import { EmitEvent, MODAL_CLOSE } from '../utils';


export default function ModalShell(props) {
  const { title, open } = props;

  return (
    <div
      className={`ModalOverlay ${open ? 'ModalOverlay--visible' : ''}`}
      onClick={() => {
        props.close();
        EmitEvent(MODAL_CLOSE, 'modal', 'close-overlay', title);
      }}
    >
      <div className="Modal" onClick={(e) => e.stopPropagation()}>
        <header className="Modal-header">
          <h3>{title}</h3>
        </header>
        <div className="Modal-body">{props.children}</div>
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
