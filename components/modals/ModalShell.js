import React, { PropTypes } from 'react';
import { TrackEvent } from '~/actions/trackEvent.js';

export default function ModalShell(props) {
  const { title, open } = props;

  return (
    <div
      className={`ModalOverlay ${open ? 'ModalOverlay--visible' : ''}`}
      onClick={() => {
        props.close();
        TrackEvent('Modal', 'close-overlay', title);
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
