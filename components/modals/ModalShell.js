import React, { PropTypes } from 'react';


export default function ModalShell(props) {
  const { title, open } = props;

  return (
    <div className={`ModalOverlay ${open ? 'ModalOverlay--visible' : ''}`}>
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
};

ModalShell.defaultProps = {
  open: false,
};
